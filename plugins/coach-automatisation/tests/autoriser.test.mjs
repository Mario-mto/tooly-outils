import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decider } from '../scripts/lib/autorisation.mjs';

const SCRIPT = fileURLToPath(new URL('../scripts/autoriser.mjs', import.meta.url));
const RACINE = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const RACINE_SLASH = RACINE.replaceAll('\\', '/');
const CLI = `node "${RACINE_SLASH}/scripts/progression.mjs"`;

function entree(tool_name, tool_input) {
  return { hook_event_name: 'PreToolUse', tool_name, tool_input };
}

function bash(command, racine = RACINE) {
  return decider(entree('Bash', { command }), racine);
}

function lire(file_path, racine = RACINE) {
  return decider(entree('Read', { file_path }), racine);
}

function accepte(resultat) {
  assert.ok(resultat, 'attendu une autorisation');
  assert.equal(typeof resultat.raison, 'string');
  assert.ok(resultat.raison.length > 0);
}

// Commandes acceptées

test('la commande liste est autorisée', () => {
  accepte(bash(`${CLI} liste`));
});

test('valider-etape avec des notes accentuées contenant « ; » est autorisée', () => {
  accepte(bash(`${CLI} valider-etape --id 2026-10-19-fiche-eclair --etape 2 --notes "Node OK ; script OK, tâche décrite : à vérifier | puis & fin"`));
});

test('les valeurs entre apostrophes droites sont autorisées', () => {
  accepte(bash(`${CLI} nouveau --titre 'Relance des factures' --porte tache`));
});

test('la racine avec des barres obliques inverses et une lettre de lecteur en minuscule est autorisée', () => {
  const chemin = RACINE.replaceAll('/', '\\').replace(/^[A-Z]:/, (l) => l.toLowerCase());
  accepte(bash(`node "${chemin}\\scripts\\progression.mjs" etat`));
});

test('la même commande passe par PowerShell', () => {
  accepte(decider(entree('PowerShell', { command: `${CLI} criteres` }), RACINE));
});

test('la lecture de skills/coach/cartes.md et de socle.json est autorisée', () => {
  accepte(lire(join(RACINE, 'skills', 'coach', 'cartes.md')));
  accepte(lire(`${RACINE_SLASH}/socle.json`));
});

// Commandes refusées

const REFUSEES = {
  'commande composée avec ;': `${CLI} liste; rm -rf x`,
  'commande composée avec &&': `${CLI} liste && x`,
  'tube': `${CLI} liste | x`,
  'redirection': `${CLI} liste > f`,
  'opérateur collé à la fin': `${CLI} liste&`,
  'substitution $(...) entre guillemets': `${CLI} valider-etape --id a --etape 1 --notes "$(calc)"`,
  'accent grave entre guillemets': `${CLI} valider-etape --id a --etape 1 --notes "a \`calc\` b"`,
  'variable PowerShell entre guillemets': `${CLI} valider-etape --id a --etape 1 --notes "$env:X"`,
  'barre inverse avant le guillemet fermant': `${CLI} arreter --id a --raison "abc\\" ; calc ; "x"`,
  'guillemet typographique fermant pour PowerShell': `${CLI} arreter --id a --raison "abc\u201d ; calc ; \u201cx"`,
  'apostrophe typographique fermante entre apostrophes': `${CLI} arreter --id a --raison 'abc\u2019 ; calc ; \u2018x'`,
  'guillemet non fermé': `${CLI} arreter --id a --raison "abc`,
  'jeton collé à une chaîne': `${CLI} arreter --id a --raison abc"def"`,
  'saut de ligne': `${CLI} liste\ncalc`,
  'retour chariot': `${CLI} liste\rcalc`,
  'autre script du même dossier': `node "${RACINE_SLASH}/scripts/autoriser.mjs" liste`,
  'progression.mjs.evil': `node "${RACINE_SLASH}/scripts/progression.mjs.evil" liste`,
  'racine avec un suffixe': `node "${RACINE_SLASH}-evil/scripts/progression.mjs" liste`,
  'remontée dans le chemin du script': `node "${RACINE_SLASH}/scripts/../scripts/progression.mjs" liste`,
  'chemin du script sans guillemets': `node ${RACINE_SLASH}/scripts/progression.mjs liste`,
  'autre exécutable node': `C:/outils/node.exe "${RACINE_SLASH}/scripts/progression.mjs" liste`,
  'node.exe': `node.exe "${RACINE_SLASH}/scripts/progression.mjs" liste`,
  'option de node avant le script': `node --require x "${RACINE_SLASH}/scripts/progression.mjs" liste`,
  'cd avant la commande': `cd x && ${CLI} liste`,
  'variable dans un jeton nu': `${CLI} liste $X`,
  'glob': `${CLI} liste *`,
  'éclatement PowerShell': `${CLI} liste @args`,
  'commande vide': '',
  'symbole --% de PowerShell': `${CLI} arreter --id a --% --raison %PATH%`,
  'caractère NUL entre guillemets': `${CLI} arreter --id a --raison "abc\u0000def"`,
  'caractère NUL entre apostrophes': `${CLI} arreter --id a --raison 'abc\u0000def'`,
};

for (const [nom, commande] of Object.entries(REFUSEES)) {
  test(`refusé : ${nom}`, () => {
    assert.equal(bash(commande), null);
    assert.equal(decider(entree('PowerShell', { command: commande }), RACINE), null);
  });
}

test('refusé : lecture qui remonte hors de la racine avec ..', () => {
  assert.equal(lire(`${RACINE_SLASH}/skills/../../coach-automatisation-evil/x.md`), null);
  assert.equal(lire(`${RACINE_SLASH}/../../REPRISE.md`), null);
});

test('refusé : lecture hors de la racine', () => {
  assert.equal(lire('C:/Windows/win.ini'), null);
  assert.equal(lire(join(tmpdir(), 'x.md')), null);
});

test('refusé : lecture dans un dossier dont le nom prolonge la racine', () => {
  assert.equal(lire(`${RACINE_SLASH}-evil/x.md`), null);
  assert.equal(lire(`${RACINE_SLASH}evil/x.md`), null);
});

test('refusé : lecture de la racine elle-même ou chemin relatif', () => {
  assert.equal(lire(RACINE), null);
  assert.equal(lire('skills/coach/cartes.md'), null);
});

test('refusé : lecture à travers une jonction qui sort de la racine', (t) => {
  const base = mkdtempSync(join(tmpdir(), 'coach-hook-'));
  const racine = join(base, 'plugin');
  const dehors = join(base, 'dehors');
  mkdirSync(racine);
  mkdirSync(dehors);
  writeFileSync(join(dehors, 'secret.txt'), 'x');
  writeFileSync(join(racine, 'dedans.txt'), 'x');
  try {
    symlinkSync(dehors, join(racine, 'lien'), 'junction');
  } catch {
    t.skip('jonction impossible sur ce poste');
    return;
  }
  accepte(lire(join(racine, 'dedans.txt'), racine));
  assert.equal(lire(join(racine, 'lien', 'secret.txt'), racine), null);
});

test('refusé : autre outil, autre événement, entrées mal formées', () => {
  assert.equal(decider(entree('Write', { file_path: join(RACINE, 'socle.json') }), RACINE), null);
  assert.equal(decider({ ...entree('Bash', { command: `${CLI} liste` }), hook_event_name: 'PostToolUse' }, RACINE), null);
  assert.equal(decider(entree('Bash', {}), RACINE), null);
  assert.equal(decider(entree('Bash', { command: 42 }), RACINE), null);
  assert.equal(decider(entree('Read', {}), RACINE), null);
  assert.equal(decider(null, RACINE), null);
  assert.equal(decider('texte', RACINE), null);
});

// Page de l'atelier : publication, base et commentaires de la page d'un parcours

const URL_PAGE = 'https://claude.ai/artifact/PageDuParcours123';
const AUTRE_URL = 'https://claude.ai/artifact/AutrePage456';
const CONNUS = () => [{ id: '2026-10-22-x', page: URL_PAGE }, { id: '2026-10-22-sans-page', page: null }];
const PAGE = readFileSync(join(RACINE, 'page', 'page.html'), 'utf8');
const TRAVAIL = mkdtempSync(join(tmpdir(), 'coach-page-'));
writeFileSync(join(TRAVAIL, 'coach-2026-10-22-x.html'), PAGE);
writeFileSync(join(TRAVAIL, 'coach-nouveau.html'), PAGE);
writeFileSync(join(TRAVAIL, 'coach-2026-10-22-inconnu.html'), PAGE);
writeFileSync(join(TRAVAIL, 'coach-2026-10-22-sans-page.html'), `${PAGE}<script>autre()</script>`);
writeFileSync(join(TRAVAIL, 'autre.html'), PAGE);

function outil(nom, params) {
  return decider(entree(nom, params), RACINE, CONNUS);
}

function publier(fichier, plus = {}) {
  return outil('Artifact', { file_path: join(TRAVAIL, fichier), ...plus });
}

const CAPACITES = { capabilities: { db: {}, comments: {} }, icon: 'coach', description: 'Ton parcours' };

test("publication de la page d'un parcours connu, ou de coach-nouveau.html, approuvée", () => {
  accepte(publier('coach-2026-10-22-x.html', CAPACITES));
  accepte(publier('coach-nouveau.html', CAPACITES));
});

test("republication sur une adresse refusée : l'adresse rangée peut venir d'une injection", () => {
  assert.equal(publier('coach-2026-10-22-x.html', { action: 'publish', url: URL_PAGE }), null);
  assert.equal(publier('coach-nouveau.html', { url: URL_PAGE }), null);
});

test('ArtifactData refusé : fichier local, autre niveau, lot, collection hors de la page du coach', () => {
  assert.equal(outil('ArtifactData', { action: 'update', url: URL_PAGE, collection: 'coach', doc_id: 'ecran', file_path: 'C:/x/.credentials.json' }), null);
  assert.equal(outil('ArtifactData', { action: 'get', url: URL_PAGE, collection: 'coach', doc_id: 'ecran', as_level: 'view' }), null);
  assert.equal(outil('ArtifactData', { action: 'batch', url: URL_PAGE, writes: [{ op: 'set', collection: 'coach', doc_id: 'ecran', data: {} }] }), null);
  assert.equal(outil('ArtifactData', { action: 'set', url: URL_PAGE, collection: 'taches', doc_id: 't1', data: {} }), null);
  assert.equal(outil('ArtifactData', { action: 'list', url: URL_PAGE, collection: 'coach/ecran/x' }), null);
  accepte(outil('ArtifactData', { action: 'get', url: URL_PAGE, collection: 'page', doc_id: 'presence' }));
});

test('ArtifactComments refusé : réponses automatiques ou filtre demandés', () => {
  assert.equal(outil('ArtifactComments', { action: 'watch', url: URL_PAGE, replies: true }), null);
  assert.equal(outil('ArtifactComments', { action: 'watch', on: 'all' }), null);
});

test('publication refusée : parcours inconnu, autre nom, contenu modifié, autre adresse', () => {
  assert.equal(publier('coach-2026-10-22-inconnu.html', CAPACITES), null);
  assert.equal(publier('autre.html', CAPACITES), null);
  assert.equal(publier('coach-2026-10-22-sans-page.html', CAPACITES), null);
  assert.equal(publier('coach-2026-10-22-x.html', { url: AUTRE_URL }), null);
  assert.equal(publier('coach-nouveau.html', { url: AUTRE_URL }), null);
  assert.equal(publier('coach-absent.html', CAPACITES), null);
});

test('publication refusée : autre capacité, fichiers joints, envoi forcé, ressource', () => {
  assert.equal(publier('coach-nouveau.html', { capabilities: { db: {}, mcp: { servers: [] } } }), null);
  assert.equal(publier('coach-nouveau.html', { files: { 'a.js': 'a.js' } }), null);
  assert.equal(publier('coach-2026-10-22-x.html', { url: URL_PAGE, force: true }), null);
  assert.equal(publier('coach-2026-10-22-x.html', { url: URL_PAGE, asset: true }), null);
});

test("Artifact : lecture de la page connue approuvée, suppression et autre page refusées", () => {
  accepte(outil('Artifact', { action: 'read', url: URL_PAGE }));
  assert.equal(outil('Artifact', { action: 'read', url: AUTRE_URL }), null);
  assert.equal(outil('Artifact', { action: 'delete', url: URL_PAGE }), null);
  assert.equal(outil('Artifact', { action: 'list' }), null);
});

test("ArtifactData sur l'adresse rangée approuvé, même une suppression de document", () => {
  accepte(outil('ArtifactData', { action: 'set', url: URL_PAGE, collection: 'coach', doc_id: 'ecran', data: { n: 1 } }));
  accepte(outil('ArtifactData', { action: 'query', url: `${URL_PAGE}?sk=abc`, collection: 'reponses' }));
  accepte(outil('ArtifactData', { action: 'delete', url: URL_PAGE, collection: 'reponses', doc_id: '1-defi', if_version: 2 }));
});

test('ArtifactData refusé : autre adresse, adresse absente ou mal formée', () => {
  assert.equal(outil('ArtifactData', { action: 'set', url: AUTRE_URL, collection: 'coach', doc_id: 'ecran' }), null);
  assert.equal(outil('ArtifactData', { action: 'get', collection: 'coach', doc_id: 'ecran' }), null);
  assert.equal(outil('ArtifactData', { action: 'get', url: 42 }), null);
  assert.equal(outil('ArtifactData', { action: 'get', url: 'https://claude.ai.evil.com/artifact/PageDuParcours123' }), null);
});

test('ArtifactComments : surveiller et lire la page approuvés, répondre et autre page refusés', () => {
  accepte(outil('ArtifactComments', { action: 'watch', url: URL_PAGE }));
  accepte(outil('ArtifactComments', { action: 'watch' }));
  accepte(outil('ArtifactComments', { action: 'read', url: URL_PAGE }));
  assert.equal(outil('ArtifactComments', { action: 'reply', url: URL_PAGE, text: 'x' }), null);
  assert.equal(outil('ArtifactComments', { action: 'read', url: AUTRE_URL }), null);
});

test('outils de page refusés si la liste des parcours ne se lit pas', () => {
  const casse = () => { throw new Error('illisible'); };
  assert.equal(decider(entree('ArtifactData', { action: 'get', url: URL_PAGE }), RACINE, casse), null);
  assert.equal(decider(entree('Artifact', { file_path: join(TRAVAIL, 'coach-nouveau.html') }), RACINE, casse), null);
});

// Script complet, lancé comme le fait Claude Code

function lancer(stdin) {
  return spawnSync(process.execPath, [SCRIPT], { input: stdin, encoding: 'utf8' });
}

test('le script sort la décision allow documentée pour une commande autorisée', () => {
  const r = lancer(JSON.stringify(entree('Bash', { command: `${CLI} liste` })));
  assert.equal(r.status, 0);
  assert.equal(r.stderr, '');
  const sortie = JSON.parse(r.stdout);
  assert.equal(sortie.hookSpecificOutput.hookEventName, 'PreToolUse');
  assert.equal(sortie.hookSpecificOutput.permissionDecision, 'allow');
  assert.match(sortie.hookSpecificOutput.permissionDecisionReason, /coach/i);
});

test('le script se tait et sort 0 sur un refus, une entrée vide ou un JSON invalide', () => {
  for (const stdin of [JSON.stringify(entree('Bash', { command: `${CLI} liste; echo x` })), '', '{pas du json']) {
    const r = lancer(stdin);
    assert.equal(r.status, 0);
    assert.equal(r.stdout, '');
    assert.equal(r.stderr, '');
  }
});
