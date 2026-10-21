import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { creerParcours, validerEtape, arreter } from '../scripts/lib/parcours.mjs';
import { lireParcours, ecrireParcours, listerParcours, parcoursActif } from '../scripts/lib/stockage.mjs';

const LE_19 = new Date(2026, 9, 19, 10, 0, 0);

function dossierNeuf() {
  return mkdtempSync(join(tmpdir(), 'coach-'));
}

function parcours(titre, quand = LE_19) {
  return creerParcours({ titre, porte: 'tache', installationRequise: false }, quand);
}

function attendCode(fn, code) {
  assert.throws(fn, (e) => {
    assert.equal(e.code, code);
    return true;
  });
}

test('écrire puis lire rend le même parcours', () => {
  const dossier = dossierNeuf();
  const p = parcours('Fiche éclair v2');
  ecrireParcours(dossier, p);
  assert.deepEqual(lireParcours(dossier, p.id), p);
  assert.deepEqual(readdirSync(join(dossier, 'parcours')), [`${p.id}.json`]);
});

test("lireParcours refuse un JSON illisible sans l'écraser", () => {
  const dossier = dossierNeuf();
  mkdirSync(join(dossier, 'parcours'));
  const chemin = join(dossier, 'parcours', 'abime.json');
  writeFileSync(chemin, '{ "version": 1, "id": ');
  assert.throws(() => lireParcours(dossier, 'abime'), (e) => {
    assert.equal(e.code, 'fichier-illisible');
    assert.ok(e.message.includes(chemin), `le message doit citer le chemin : ${e.message}`);
    return true;
  });
  assert.equal(readFileSync(chemin, 'utf8'), '{ "version": 1, "id": ');
});

test("lireParcours refuse un JSON valide qui n'est pas un parcours", () => {
  const dossier = dossierNeuf();
  mkdirSync(join(dossier, 'parcours'));
  writeFileSync(join(dossier, 'parcours', 'bizarre.json'), '{"bonjour": true}');
  attendCode(() => lireParcours(dossier, 'bizarre'), 'fichier-illisible');
});

test('lireParcours signale un parcours introuvable', () => {
  attendCode(() => lireParcours(dossierNeuf(), 'absent'), 'parcours-introuvable');
});

test('un id avec des caractères de chemin est refusé', () => {
  attendCode(() => lireParcours(dossierNeuf(), '../secret'), 'id-invalide');
});

test('listerParcours rend une liste vide sans dossier', () => {
  assert.deepEqual(listerParcours(dossierNeuf()), []);
});

test('parcoursActif rend le plus récent des parcours en cours', () => {
  const dossier = dossierNeuf();
  const ancien = parcours('Ancien');
  const recent = validerEtape(parcours('Récent'), 1, new Date(2026, 9, 20));
  const a3 = validerEtape(validerEtape(parcours('Arrêté'), 1, LE_19), 2, LE_19);
  const arrete = arreter(a3, 'Trop rare', new Date(2026, 9, 21));
  for (const p of [ancien, recent, arrete]) ecrireParcours(dossier, p);
  assert.equal(listerParcours(dossier).length, 3);
  assert.equal(parcoursActif(dossier).id, recent.id);
});

test('parcoursActif rend null sans parcours en cours', () => {
  assert.equal(parcoursActif(dossierNeuf()), null);
});
