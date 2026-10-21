import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { sep } from 'node:path';

const socle = JSON.parse(readFileSync(new URL('../socle.json', import.meta.url), 'utf8'));

test('le socle compte 11 concepts aux ids uniques', () => {
  assert.equal(socle.length, 11);
  assert.equal(new Set(socle.map((c) => c.id)).size, 11);
});

test('chaque concept a une étape entre 3 et 8 et une définition non vide', () => {
  for (const c of socle) {
    assert.ok(Number.isInteger(c.etape) && c.etape >= 3 && c.etape <= 8, `étape invalide pour ${c.id}`);
    assert.ok(typeof c.definition === 'string' && c.definition.trim().length > 0, `définition vide pour ${c.id}`);
    assert.ok(typeof c.nom === 'string' && c.nom.trim().length > 0, `nom vide pour ${c.id}`);
  }
});

test('les fichiers du skill coach ne contiennent aucun tiret long', () => {
  const dossier = new URL('../skills/coach/', import.meta.url);
  const fichiers = readdirSync(dossier, { recursive: true }).filter((f) => f.endsWith('.md'));
  assert.ok(fichiers.length >= 10);
  for (const f of fichiers) {
    assert.ok(!readFileSync(new URL(f.split(sep).join('/'), dossier), 'utf8').includes(String.fromCharCode(0x2014)), f);
  }
});

test('le skill coach renvoie à la page', () => {
  const skill = readFileSync(new URL('../skills/coach/SKILL.md', import.meta.url), 'utf8');
  assert.ok(skill.includes('page.md'));
});

test('page.md : notification déjà traitée ignorée, accusé de réception, bandeau seul, choix lus à Continuer', () => {
  const page = readFileSync(new URL('../skills/coach/page.md', import.meta.url), 'utf8');
  assert.ok(page.includes('déjà traitée'), 'règle des notifications déjà traitées');
  assert.ok(page.includes('`vu`'), 'accusé de réception du même n');
  assert.ok(page.includes("Un écran à bandeau n'a pas de cartes"), 'bandeau seul');
  assert.ok(page.includes('lis aussi ses choix'), 'Continuer lit les choix');
});

test("0-installation : pas de bandeau pour la relance, écran d'attente", () => {
  const etape = readFileSync(new URL('../skills/coach/etapes/0-installation.md', import.meta.url), 'utf8');
  assert.ok(!etape.includes('bandeau sans'), 'plus de bandeau sans C\'est fait');
  assert.ok(etape.includes('écran `attente`'));
});
