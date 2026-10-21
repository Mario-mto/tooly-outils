import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ErreurParcours,
  FORMES_FINALES,
  TITRES_FICHE,
  creerParcours,
  validerEtape,
  noterCarte,
  arreter,
  enregistrerLivraison,
  confirmerFonctionnement,
  calculerCriteres,
  resumer,
} from '../scripts/lib/parcours.mjs';

const socle = JSON.parse(readFileSync(new URL('../socle.json', import.meta.url), 'utf8'));
const LE_19 = new Date(2026, 9, 19, 10, 0, 0);
const LE_23 = new Date(2026, 9, 23, 10, 0, 0);
const LE_26 = new Date(2026, 9, 26, 9, 0, 0);

const FICHE = TITRES_FICHE.map((t) => `${t}\n\nTexte.\n`).join('\n');
const LIVRAISON = {
  forme: 'flux-zoho',
  declencheur: "Une affaire passe à l'étape Gagnée",
  fiche: 'C:/automatisations/facturation/fiche.md',
  ficheContenu: FICHE,
};

function nouveau(titre = 'Fiche éclair v2') {
  return creerParcours({ titre, porte: 'tache', installationRequise: false }, LE_19);
}

function jusqua(p, etape) {
  while (p.etapeCourante < etape) p = validerEtape(p, p.etapeCourante, LE_19);
  return p;
}

function livre(quand = LE_19) {
  const p = enregistrerLivraison(jusqua(nouveau(), 8), LIVRAISON, quand);
  return validerEtape(p, 8, quand);
}

function attendErreur(fn, code, motif) {
  assert.throws(fn, (e) => {
    assert.ok(e instanceof ErreurParcours, `attendu une ErreurParcours, reçu ${e}`);
    assert.equal(e.code, code);
    if (motif) assert.match(e.message, motif);
    return true;
  });
}

test('les formes finales et les titres de fiche sont ceux du plan', () => {
  assert.deepEqual(FORMES_FINALES, ['routine-claude', 'flux-zoho', 'deluge', 'tache-poste', 'mini-appli']);
  assert.deepEqual(TITRES_FICHE, ['## Ce que ça fait', '## Déclencheur', '## Accès utilisés', '## Où ça tourne', '## Si ça casse']);
});

test("enregistrerLivraison exige d'être à l'étape 8", () => {
  attendErreur(() => enregistrerLivraison(jusqua(nouveau(), 5), LIVRAISON, LE_19), 'livraison-hors-etape-8');
});

test('un déclencheur vide est refusé', () => {
  attendErreur(() => enregistrerLivraison(jusqua(nouveau(), 8), { ...LIVRAISON, declencheur: ' ' }, LE_19), 'declencheur-manquant');
});

test("une skill n'est pas une forme finale", () => {
  const p = jusqua(nouveau(), 8);
  attendErreur(() => enregistrerLivraison(p, { ...LIVRAISON, forme: 'skill' }, LE_19), 'forme-non-finale');
  attendErreur(() => enregistrerLivraison(p, { ...LIVRAISON, forme: 'mcp' }, LE_19), 'forme-non-finale');
});

test('une fiche sans « ## Si ça casse » est refusée', () => {
  const sansCasse = FICHE.replace('## Si ça casse', '## Autre chose');
  attendErreur(
    () => enregistrerLivraison(jusqua(nouveau(), 8), { ...LIVRAISON, ficheContenu: sansCasse }, LE_19),
    'fiche-incomplete',
    /## Si ça casse/,
  );
});

test('une fiche avec une section vide est refusée', () => {
  const vide = FICHE.replace('## Accès utilisés\n\nTexte.\n', '## Accès utilisés\n\n   \n');
  attendErreur(
    () => enregistrerLivraison(jusqua(nouveau(), 8), { ...LIVRAISON, ficheContenu: vide }, LE_19),
    'fiche-non-remplie',
    /## Accès utilisés/,
  );
});

test('une fiche qui garde le texte du modèle est refusée', () => {
  const modele = readFileSync(new URL('../skills/coach/modele-fiche.md', import.meta.url), 'utf8');
  attendErreur(
    () => enregistrerLivraison(jusqua(nouveau(), 8), { ...LIVRAISON, ficheContenu: modele }, LE_19),
    'fiche-non-remplie',
    /</,
  );
  const unReste = FICHE.replace('## Si ça casse\n\nTexte.', "## Si ça casse\n\n<Comment s'en apercevoir,\nqui prévenir.>");
  attendErreur(
    () => enregistrerLivraison(jusqua(nouveau(), 8), { ...LIVRAISON, ficheContenu: unReste }, LE_19),
    'fiche-non-remplie',
  );
});

test('une fiche remplie avec un lien ou une comparaison passe', () => {
  const remplie = FICHE.replace('## Où ça tourne\n\nTexte.', '## Où ça tourne\n\nFlux <https://flow.zoho.com/flux>, si montant < 100 et délai > 30 jours.');
  const p = enregistrerLivraison(jusqua(nouveau(), 8), { ...LIVRAISON, ficheContenu: remplie }, LE_19);
  assert.equal(p.livraison.forme, 'flux-zoho');
});

test('une livraison valide est enregistrée', () => {
  const p = enregistrerLivraison(jusqua(nouveau(), 8), LIVRAISON, LE_19);
  assert.deepEqual(p.livraison, {
    forme: 'flux-zoho',
    declencheur: LIVRAISON.declencheur,
    fiche: LIVRAISON.fiche,
    livreLe: LE_19.toISOString(),
    fonctionnementConfirmeLe: null,
  });
});

test("valider l'étape 8 après une livraison rend le parcours livré", () => {
  const p = livre();
  assert.equal(p.statut, 'livre');
  assert.equal(p.etapeCourante, 9);
});

test('confirmerFonctionnement refuse avant 7 jours', () => {
  attendErreur(() => confirmerFonctionnement(livre(), LE_23), 'trop-tot', /3 jours/);
});

test('confirmerFonctionnement refuse sans livraison', () => {
  attendErreur(() => confirmerFonctionnement(nouveau(), LE_26), 'livraison-manquante');
});

test('confirmerFonctionnement accepte à 7 jours', () => {
  const p = confirmerFonctionnement(livre(), LE_26);
  assert.equal(p.livraison.fonctionnementConfirmeLe, LE_26.toISOString());
});

test('critères : rien de rempli pour un parcours neuf', () => {
  const c = calculerCriteres([nouveau()], socle, LE_19);
  assert.equal(c.automatisationQuiTourne, false);
  assert.equal(c.socle.ok, false);
  assert.equal(c.socle.manquants.length, 11);
  assert.equal(c.ficheComplete, false);
});

test('automatisationQuiTourne vrai seulement avec une confirmation', () => {
  assert.equal(calculerCriteres([livre()], socle, LE_23).automatisationQuiTourne, false);
  assert.equal(calculerCriteres([livre()], socle, LE_23).ficheComplete, true);
  const confirme = confirmerFonctionnement(livre(), LE_26);
  assert.equal(calculerCriteres([confirme], socle, LE_26).automatisationQuiTourne, true);
});

test('socle.manquants liste les concepts jamais réussis, tous parcours confondus', () => {
  let a = noterCarte(nouveau('Premier'), 'valeur', 'reussi', socle, LE_19);
  a = noterCarte(a, 'declencheur', 'rate', socle, LE_19);
  let b = noterCarte(nouveau('Second'), 'decoupage', 'reussi', socle, LE_19);
  const c = calculerCriteres([a, b], socle, LE_19);
  assert.equal(c.socle.manquants.length, 9);
  assert.ok(c.socle.manquants.includes('declencheur'));
  assert.ok(!c.socle.manquants.includes('valeur'));
  assert.ok(!c.socle.manquants.includes('decoupage'));

  for (const concept of socle) b = noterCarte(b, concept.id, 'reussi', socle, LE_19);
  assert.deepEqual(calculerCriteres([a, b], socle, LE_19).socle, { ok: true, manquants: [] });
});

test('un parcours arrêté compte pour le socle mais pas pour la livraison', () => {
  let p = noterCarte(jusqua(nouveau(), 3), 'quand-ne-pas-automatiser', 'reussi', socle, LE_19);
  p = arreter(p, 'Tâche faite une fois par an', LE_19);
  const c = calculerCriteres([p], socle, LE_19);
  assert.ok(!c.socle.manquants.includes('quand-ne-pas-automatiser'));
  assert.equal(c.automatisationQuiTourne, false);
  assert.equal(c.ficheComplete, false);
});

test("resumer donne l'étape réelle d'un arrêt", () => {
  const a4 = arreter(jusqua(nouveau('Quatre'), 4), 'Aucun déclencheur ne tient', LE_19);
  const a3 = arreter(jusqua(nouveau('Trois'), 3), 'Une fois par an', LE_19);
  const md = resumer([a4, a3], socle, LE_19);
  assert.match(md, /Quatre \(porte tache\) : arrêté à l'étape 4 \(Aucun déclencheur ne tient\)/);
  assert.match(md, /Trois \(porte tache\) : arrêté à l'étape 3 \(Une fois par an\)/);
  const c = calculerCriteres([a4], socle, LE_19);
  assert.equal(c.ficheComplete, false);
  assert.equal(c.automatisationQuiTourne, false);
});

test('resumer cite les concepts acquis, à revoir, les livraisons et l\'état des trois critères', () => {
  let p = noterCarte(jusqua(nouveau(), 8), 'valeur', 'reussi', socle, LE_19);
  p = noterCarte(p, 'declencheur', 'rate', socle, LE_19);
  p = noterCarte(p, 'declencheur', 'rate', socle, LE_19);
  p = validerEtape(enregistrerLivraison(p, LIVRAISON, LE_19), 8, LE_19);
  const md = resumer([p], socle, LE_23);
  assert.match(md, /^# /);
  assert.match(md, /Concepts acquis/);
  assert.match(md, /Valeur d'une automatisation/);
  assert.match(md, /À revoir/);
  assert.match(md, /Déclencheur/);
  assert.match(md, /Livraisons/);
  assert.match(md, /Fiche éclair v2/);
  assert.match(md, /flux-zoho/);
  assert.match(md, /Automatisation qui tourne depuis une semaine : non/);
  assert.match(md, /Socle réussi : non/);
  assert.match(md, /Fiche complète : oui/);
});
