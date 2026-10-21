import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ErreurParcours,
  creerParcours,
  validerEtape,
  noterCarte,
  arreter,
  enregistrerPage,
} from '../scripts/lib/parcours.mjs';

const socle = JSON.parse(readFileSync(new URL('../socle.json', import.meta.url), 'utf8'));
const LE_19 = new Date(2026, 9, 19, 10, 0, 0);
const LE_20 = new Date(2026, 9, 20, 10, 0, 0);

function nouveau(options = {}) {
  return creerParcours({ titre: 'Fiche éclair v2', porte: 'tache', installationRequise: false, ...options }, LE_19);
}

function jusqua(p, etape) {
  while (p.etapeCourante < etape) p = validerEtape(p, p.etapeCourante, LE_19);
  return p;
}

function attendErreur(fn, code) {
  assert.throws(fn, (e) => {
    assert.ok(e instanceof ErreurParcours, `attendu une ErreurParcours, reçu ${e}`);
    assert.equal(e.code, code);
    return true;
  });
}

test("creerParcours fabrique l'id depuis la date et le titre", () => {
  const p = nouveau();
  assert.equal(p.id, '2026-10-19-fiche-eclair-v2');
  assert.equal(p.titre, 'Fiche éclair v2');
  assert.equal(p.version, 1);
  assert.equal(p.statut, 'en-cours');
  assert.deepEqual(Object.keys(p.etapes), ['0', '1', '2', '3', '4', '5', '6', '7', '8']);
  assert.equal(p.creeLe, LE_19.toISOString());
  assert.equal(p.majLe, LE_19.toISOString());
});

test('creerParcours refuse une porte inconnue', () => {
  attendErreur(() => nouveau({ porte: 'fenetre' }), 'porte-inconnue');
});

test('creerParcours refuse un titre vide', () => {
  attendErreur(() => nouveau({ titre: '   ' }), 'titre-manquant');
});

test("sans installation requise, l'étape 0 est non-requise et le parcours démarre à 1", () => {
  const p = nouveau();
  assert.equal(p.etapes['0'].statut, 'non-requise');
  assert.equal(p.etapeCourante, 1);
});

test("avec installation requise, le parcours démarre à 0", () => {
  const p = nouveau({ installationRequise: true });
  assert.equal(p.etapes['0'].statut, 'a-faire');
  assert.equal(p.etapeCourante, 0);
});

test("validerEtape marque l'étape validée et avance", () => {
  const p = validerEtape(nouveau(), 1, LE_20);
  assert.equal(p.etapes['1'].statut, 'validee');
  assert.equal(p.etapes['1'].valideeLe, LE_20.toISOString());
  assert.equal(p.etapeCourante, 2);
  assert.equal(p.majLe, LE_20.toISOString());
});

test('validerEtape refuse une étape hors ordre', () => {
  assert.throws(() => validerEtape(nouveau(), 2, LE_19), (e) => {
    assert.equal(e.code, 'etape-hors-ordre');
    assert.match(e.message, /étape 1/);
    return true;
  });
});

test('validerEtape refuse un parcours arrêté ou livré', () => {
  const arrete = arreter(jusqua(nouveau(), 3), 'Tâche trop rare', LE_19);
  attendErreur(() => validerEtape(arrete, 3, LE_19), 'parcours-clos');
  const livre = { ...jusqua(nouveau(), 3), statut: 'livre' };
  attendErreur(() => validerEtape(livre, 3, LE_19), 'parcours-clos');
});

test("valider l'étape 8 sans livraison est refusé", () => {
  const p = jusqua(nouveau(), 8);
  attendErreur(() => validerEtape(p, 8, LE_19), 'livraison-manquante');
});

test('une carte réussie rend le concept acquis', () => {
  const p = noterCarte(nouveau(), 'valeur', 'reussi', socle, LE_20);
  assert.equal(p.concepts.valeur.statut, 'acquis');
  assert.deepEqual(p.concepts.valeur.essais, [{ resultat: 'reussi', le: LE_20.toISOString() }]);
});

test('une carte ratée laisse le concept en cours', () => {
  const p = noterCarte(nouveau(), 'valeur', 'rate', socle, LE_19);
  assert.equal(p.concepts.valeur.statut, 'en-cours');
});

test('deux cartes ratées sans réussite rendent le concept a-revoir', () => {
  let p = noterCarte(nouveau(), 'valeur', 'rate', socle, LE_19);
  p = noterCarte(p, 'valeur', 'rate', socle, LE_19);
  assert.equal(p.concepts.valeur.statut, 'a-revoir');
});

test('une réussite après deux échecs le rend acquis', () => {
  let p = noterCarte(nouveau(), 'valeur', 'rate', socle, LE_19);
  p = noterCarte(p, 'valeur', 'rate', socle, LE_19);
  p = noterCarte(p, 'valeur', 'reussi', socle, LE_19);
  assert.equal(p.concepts.valeur.statut, 'acquis');
  assert.equal(p.concepts.valeur.essais.length, 3);
});

test('noterCarte refuse un concept hors socle', () => {
  attendErreur(() => noterCarte(nouveau(), 'astrologie', 'reussi', socle, LE_19), 'concept-inconnu');
});

test('noterCarte refuse un résultat inconnu', () => {
  attendErreur(() => noterCarte(nouveau(), 'valeur', 'bof', socle, LE_19), 'resultat-inconnu');
});

test("arreter n'est permis qu'à l'étape 3 ou 4", () => {
  attendErreur(() => arreter(nouveau(), 'Trop rare', LE_19), 'arret-hors-etape');
  attendErreur(() => arreter(jusqua(nouveau(), 5), 'Trop tard', LE_19), 'arret-hors-etape');
  const a3 = jusqua(nouveau(), 3);
  attendErreur(() => arreter(a3, '  ', LE_19), 'raison-manquante');
  const p = arreter(a3, 'Trop rare', LE_20);
  assert.equal(p.statut, 'arrete');
  assert.deepEqual(p.arret, { etape: 3, raison: 'Trop rare', le: LE_20.toISOString() });
  attendErreur(() => arreter(p, 'Encore', LE_20), 'parcours-clos');
});

test("arreter est permis à l'étape 4 quand aucun déclencheur ne tient", () => {
  const p = arreter(jusqua(nouveau(), 4), 'Aucun déclencheur ne tient', LE_20);
  assert.equal(p.statut, 'arrete');
  assert.deepEqual(p.arret, { etape: 4, raison: 'Aucun déclencheur ne tient', le: LE_20.toISOString() });
});

test("validerEtape garde les notes de l'étape", () => {
  const p = validerEtape(nouveau(), 1, LE_20, '  Relance des factures échues ; porte tâche  ');
  assert.equal(p.etapes['1'].notes, 'Relance des factures échues ; porte tâche');
  assert.equal(p.etapes['1'].statut, 'validee');
  const sansNotes = validerEtape(nouveau(), 1, LE_20);
  assert.equal(sansNotes.etapes['1'].notes, undefined);
  assert.equal(validerEtape(nouveau(), 1, LE_20, '   ').etapes['1'].notes, undefined);
  assert.equal(p.version, 1);
});

test('noterCarte refuse un parcours clos', () => {
  const arrete = arreter(jusqua(nouveau(), 3), 'Tâche trop rare', LE_19);
  attendErreur(() => noterCarte(arrete, 'valeur', 'reussi', socle, LE_19), 'parcours-clos');
});

test("les fonctions rendent une copie sans toucher l'original", () => {
  const p = nouveau();
  const avant = structuredClone(p);
  validerEtape(p, 1, LE_20);
  noterCarte(p, 'valeur', 'reussi', socle, LE_20);
  arreter(jusqua(p, 3), 'Trop rare', LE_20);
  assert.deepEqual(p, avant);
});

test('enregistrerPage range une adresse claude.ai et rend une copie', () => {
  const p = nouveau();
  const avant = structuredClone(p);
  const apres = enregistrerPage(p, 'https://claude.ai/artifact/abc');
  assert.equal(apres.page, 'https://claude.ai/artifact/abc');
  assert.deepEqual(p, avant);
});

test('enregistrerPage refuse une adresse qui ne commence pas par https://claude.ai/', () => {
  attendErreur(() => enregistrerPage(nouveau(), 'http://exemple.com'), 'url-invalide');
  attendErreur(() => enregistrerPage(nouveau(), 'https://claude.ai.evil.com/x'), 'url-invalide');
  attendErreur(() => enregistrerPage(nouveau(), ''), 'url-invalide');
  attendErreur(() => enregistrerPage(nouveau(), undefined), 'url-invalide');
});

test('creerParcours démarre sans page', () => {
  assert.equal(nouveau().page, null);
});
