import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TITRES_FICHE } from '../scripts/lib/parcours.mjs';

const CLI = fileURLToPath(new URL('../scripts/progression.mjs', import.meta.url));

function dossierNeuf() {
  return mkdtempSync(join(tmpdir(), 'coach-cli-'));
}

function lancer(dossier, ...args) {
  const sortie = execFileSync(process.execPath, [CLI, ...args, '--data', dossier], { encoding: 'utf8' });
  return sortie;
}

function json(dossier, ...args) {
  return JSON.parse(lancer(dossier, ...args));
}

function echec(dossier, ...args) {
  const r = spawnSync(process.execPath, [CLI, ...args, '--data', dossier], { encoding: 'utf8' });
  return { code: r.status, erreur: JSON.parse(r.stderr), stdout: r.stdout };
}

function jusqua(dossier, id, etape) {
  let p = json(dossier, 'etat', '--id', id);
  while (p.etapeCourante < etape) p = json(dossier, 'valider-etape', '--id', id, '--etape', String(p.etapeCourante));
  return p;
}

test('la CLI fonctionne dans un dossier avec espace et accent', () => {
  const dossier = join(dossierNeuf(), 'dossier avec espace é');
  const cree = json(dossier, 'nouveau', '--titre', 'Fiche éclair v2', '--porte', 'tache');
  const etat = json(dossier, 'etat');
  assert.equal(etat.id, cree.id);
  assert.match(cree.id, /-fiche-eclair-v2$/);
});

test('la CLI sort une erreur JSON et le code 1 sur une étape hors ordre', () => {
  const dossier = dossierNeuf();
  const { id } = json(dossier, 'nouveau', '--titre', 'Essai', '--porte', 'idee');
  const r = echec(dossier, 'valider-etape', '--id', id, '--etape', '4');
  assert.equal(r.code, 1);
  assert.equal(r.erreur.erreur, 'etape-hors-ordre');
  assert.match(r.erreur.message, /étape 1/);
  assert.equal(r.stdout, '');
});

test('la CLI refuse une commande inconnue', () => {
  const r = echec(dossierNeuf(), 'danser');
  assert.equal(r.code, 1);
  assert.equal(r.erreur.erreur, 'commande-inconnue');
});

test('la CLI refuse une option manquante', () => {
  const r = echec(dossierNeuf(), 'nouveau', '--porte', 'tache');
  assert.equal(r.erreur.erreur, 'option-manquante');
  assert.match(r.erreur.message, /--titre/);
});

test('nouveau refuse un parcours qui existe déjà', () => {
  const dossier = dossierNeuf();
  json(dossier, 'nouveau', '--titre', 'Essai', '--porte', 'tache');
  assert.equal(echec(dossier, 'nouveau', '--titre', 'Essai', '--porte', 'tache').erreur.erreur, 'parcours-existe');
});

test('nouveau avec installation requise démarre à 0', () => {
  const p = json(dossierNeuf(), 'nouveau', '--titre', 'Essai', '--porte', 'tache', '--installation-requise');
  assert.equal(p.etapeCourante, 0);
});

test('carte, arreter, liste et criteres passent par la CLI', () => {
  const dossier = dossierNeuf();
  const { id } = json(dossier, 'nouveau', '--titre', 'Rare', '--porte', 'tache');
  jusqua(dossier, id, 3);
  const apresCarte = json(dossier, 'carte', '--id', id, '--concept', 'quand-ne-pas-automatiser', '--resultat', 'reussi');
  assert.equal(apresCarte.concepts['quand-ne-pas-automatiser'].statut, 'acquis');
  const arrete = json(dossier, 'arreter', '--id', id, '--raison', 'Une fois par an');
  assert.equal(arrete.statut, 'arrete');
  assert.equal(json(dossier, 'liste').length, 1);
  const criteres = json(dossier, 'criteres');
  assert.equal(criteres.socle.manquants.length, 10);
  assert.equal(json(dossier, 'etat'), null);
});

test('livrer lit la fiche depuis le fichier donné', () => {
  const dossier = dossierNeuf();
  const automatisation = join(dossierNeuf(), 'mon automatisation');
  mkdirSync(automatisation);
  const fiche = join(automatisation, 'fiche.md');
  writeFileSync(fiche, TITRES_FICHE.map((t) => `${t}\n\nTexte.\n`).join('\n'));
  const { id } = json(dossier, 'nouveau', '--titre', 'Facturation', '--porte', 'tache');
  jusqua(dossier, id, 8);
  const p = json(dossier, 'livrer', '--id', id, '--forme', 'flux-zoho', '--declencheur', 'Affaire gagnée', '--fiche', fiche);
  assert.equal(p.livraison.fiche, fiche);
  assert.equal(json(dossier, 'valider-etape', '--id', id, '--etape', '8').statut, 'livre');

  writeFileSync(fiche, '## Ce que ça fait\n');
  const { id: autre } = json(dossier, 'nouveau', '--titre', 'Autre', '--porte', 'tache');
  jusqua(dossier, autre, 8);
  const r = echec(dossier, 'livrer', '--id', autre, '--forme', 'deluge', '--declencheur', 'Chaque lundi', '--fiche', fiche);
  assert.equal(r.erreur.erreur, 'fiche-incomplete');
  const absente = echec(dossier, 'livrer', '--id', autre, '--forme', 'deluge', '--declencheur', 'Chaque lundi', '--fiche', join(automatisation, 'rien.md'));
  assert.equal(absente.erreur.erreur, 'fiche-introuvable');
});

test('valider-etape range les notes, que etat rend à la reprise', () => {
  const dossier = dossierNeuf();
  const { id } = json(dossier, 'nouveau', '--titre', 'Relance', '--porte', 'tache');
  const notes = 'Relance des factures échues ; déclencheur « chaque lundi à 8 h » ; Zoho Books';
  const p = json(dossier, 'valider-etape', '--id', id, '--etape', '1', '--notes', notes);
  assert.equal(p.etapes['1'].notes, notes);
  assert.equal(json(dossier, 'etat', '--id', id).etapes['1'].notes, notes);
  const sansNotes = json(dossier, 'valider-etape', '--id', id, '--etape', '2');
  assert.equal(sansNotes.etapes['2'].notes, undefined);
});

function sansDonneesExplicites(env) {
  const copie = { ...process.env, ...env };
  if (!('CLAUDE_PLUGIN_DATA' in env)) delete copie.CLAUDE_PLUGIN_DATA;
  return copie;
}

test('sans --data ni CLAUDE_PLUGIN_DATA, les données vont dans ~/.coach-automatisation', () => {
  const maison = dossierNeuf();
  const env = sansDonneesExplicites({ USERPROFILE: maison, HOME: maison });
  const p = JSON.parse(execFileSync(process.execPath, [CLI, 'nouveau', '--titre', 'Repli', '--porte', 'tache'], { encoding: 'utf8', env }));
  assert.ok(existsSync(join(maison, '.coach-automatisation', 'parcours', `${p.id}.json`)));
});

test('CLAUDE_PLUGIN_DATA passe avant le repli, --data passe avant les deux', () => {
  const maison = dossierNeuf();
  const variable = dossierNeuf();
  const option = dossierNeuf();
  const env = sansDonneesExplicites({ USERPROFILE: maison, HOME: maison, CLAUDE_PLUGIN_DATA: variable });
  const a = JSON.parse(execFileSync(process.execPath, [CLI, 'nouveau', '--titre', 'Variable', '--porte', 'tache'], { encoding: 'utf8', env }));
  assert.ok(existsSync(join(variable, 'parcours', `${a.id}.json`)));
  const b = JSON.parse(execFileSync(process.execPath, [CLI, 'nouveau', '--titre', 'Option', '--porte', 'tache', '--data', option], { encoding: 'utf8', env }));
  assert.ok(existsSync(join(option, 'parcours', `${b.id}.json`)));
  assert.ok(!existsSync(join(maison, '.coach-automatisation')));
});

test('livrer enregistre le chemin complet d\'une fiche donnée en relatif', () => {
  const dossier = dossierNeuf();
  const automatisation = dossierNeuf();
  writeFileSync(join(automatisation, 'fiche.md'), TITRES_FICHE.map((t) => `${t}\n\nTexte.\n`).join('\n'));
  const { id } = json(dossier, 'nouveau', '--titre', 'Relatif', '--porte', 'tache');
  jusqua(dossier, id, 8);
  const sortie = execFileSync(
    process.execPath,
    [CLI, 'livrer', '--id', id, '--forme', 'deluge', '--declencheur', 'Chaque lundi', '--fiche', 'fiche.md', '--data', dossier],
    { encoding: 'utf8', cwd: automatisation },
  );
  assert.equal(JSON.parse(sortie).livraison.fiche, resolve(automatisation, 'fiche.md'));
});

test('resume sort du Markdown', () => {
  const dossier = dossierNeuf();
  json(dossier, 'nouveau', '--titre', 'Essai', '--porte', 'existante');
  const md = lancer(dossier, 'resume');
  assert.match(md, /^# Résumé de progression/);
  assert.match(md, /## Critères vers le niveau 3/);
  assert.match(md, /Essai/);
});

// Source de la page remplacée pour les tests : on n'écrit jamais dans le plugin.
function fausseSource(contenu = '<!doctype html><title>Essai é</title>\n<p>Page d\'essai</p>\n') {
  const source = join(dossierNeuf(), 'source.html');
  writeFileSync(source, contenu);
  return source;
}

function avecSource(source, dossier, ...args) {
  const env = { ...process.env, COACH_PAGE_SOURCE: source };
  return spawnSync(process.execPath, [CLI, ...args, '--data', dossier], { encoding: 'utf8', env });
}

test('page copie la page dans un dossier avec espace et accent et rend son chemin complet', () => {
  const dossier = dossierNeuf();
  const { id } = json(dossier, 'nouveau', '--titre', 'Essai page', '--porte', 'tache');
  const source = fausseSource();
  const vers = join(dossierNeuf(), 'dossier é essai');
  mkdirSync(vers);
  const r = avecSource(source, dossier, 'page', '--id', id, '--vers', vers);
  assert.equal(r.status, 0, r.stderr);
  const { fichier } = JSON.parse(r.stdout);
  assert.equal(fichier, join(vers, `coach-${id}.html`));
  assert.equal(readFileSync(fichier, 'utf8'), readFileSync(source, 'utf8'));
});

test('page sans id copie la page de l\'accueil, avant la création du parcours', () => {
  const dossier = dossierNeuf();
  const source = fausseSource();
  const vers = dossierNeuf();
  const r = avecSource(source, dossier, 'page', '--vers', vers);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(r.stdout).fichier, join(vers, 'coach-nouveau.html'));
});

test('page refuse un dossier absent, un parcours inconnu et une page absente', () => {
  const dossier = dossierNeuf();
  const { id } = json(dossier, 'nouveau', '--titre', 'Essai page', '--porte', 'tache');
  const source = fausseSource();
  const vers = dossierNeuf();
  const absent = avecSource(source, dossier, 'page', '--id', id, '--vers', join(vers, 'rien'));
  assert.equal(JSON.parse(absent.stderr).erreur, 'dossier-absent');
  const inconnu = avecSource(source, dossier, 'page', '--id', 'inconnu', '--vers', vers);
  assert.equal(JSON.parse(inconnu.stderr).erreur, 'parcours-introuvable');
  const sansPage = avecSource(join(vers, 'nexiste-pas.html'), dossier, 'page', '--id', id, '--vers', vers);
  assert.equal(JSON.parse(sansPage.stderr).erreur, 'page-absente');
});

test('adresse puis etat rend la même URL dans page', () => {
  const dossier = dossierNeuf();
  const { id } = json(dossier, 'nouveau', '--titre', 'Essai adresse', '--porte', 'tache');
  assert.equal(json(dossier, 'etat', '--id', id).page, null);
  const url = 'https://claude.ai/artifact/abc123';
  assert.equal(json(dossier, 'adresse', '--id', id, '--url', url).page, url);
  assert.equal(json(dossier, 'etat', '--id', id).page, url);
  assert.equal(json(dossier, 'etat').page, url);
});

test('adresse refuse une URL qui ne vient pas de claude.ai', () => {
  const dossier = dossierNeuf();
  const { id } = json(dossier, 'nouveau', '--titre', 'Essai adresse', '--porte', 'tache');
  const r = echec(dossier, 'adresse', '--id', id, '--url', 'http://exemple.com');
  assert.equal(r.code, 1);
  assert.equal(r.erreur.erreur, 'url-invalide');
  assert.equal(json(dossier, 'etat', '--id', id).page, null);
});

test('un parcours créé avant le champ page se lit avec page: null', () => {
  const dossier = dossierNeuf();
  const { id } = json(dossier, 'nouveau', '--titre', 'Ancien', '--porte', 'tache');
  const chemin = join(dossier, 'parcours', `${id}.json`);
  const ancien = JSON.parse(readFileSync(chemin, 'utf8'));
  delete ancien.page;
  writeFileSync(chemin, JSON.stringify(ancien));
  assert.equal(json(dossier, 'etat', '--id', id).page, null);
  assert.equal(json(dossier, 'etat').page, null);
});
