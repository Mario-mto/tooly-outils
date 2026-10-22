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

test('0-installation : pas de bandeau pour la relance, écran relance', () => {
  const etape = readFileSync(new URL('../skills/coach/etapes/0-installation.md', import.meta.url), 'utf8');
  assert.ok(!etape.includes('bandeau sans'), 'plus de bandeau sans C\'est fait');
  assert.ok(etape.includes('écran `relance`'));
});

test('chaque concept a une image du quotidien, sans jargon technique', () => {
  for (const c of socle) {
    assert.ok(typeof c.image === 'string' && c.image.trim().length > 0, `image vide pour ${c.id}`);
    assert.ok(!/\b(workflow|Deluge|Zoho|API|script)\b/i.test(c.image), `jargon dans l'image de ${c.id}`);
  }
});

test('les explications suivent la méthode Feynman avec une image du quotidien', () => {
  const lire = (f) => readFileSync(new URL(`../skills/coach/${f}`, import.meta.url), 'utf8');
  assert.ok(lire('SKILL.md').includes('Feynman'), 'SKILL : méthode Feynman');
  assert.ok(lire('SKILL.md').includes('`image`'), 'SKILL : image du socle');
  assert.ok(lire('page.md').includes("commence par l'image"), "page.md : l'explication commence par l'image");
  assert.ok(lire('cartes.md').includes('image du quotidien'), 'cartes.md : image du quotidien après un raté');
});

test("page.md décrit l'écran relance, et la pause comme l'arrêt l'utilisent", () => {
  const lire = (f) => readFileSync(new URL(`../skills/coach/${f}`, import.meta.url), 'utf8');
  assert.ok(lire('page.md').includes('commandes: [{ aTaper, texte }]'), 'format de relance');
  const skill = lire('SKILL.md');
  assert.ok(skill.includes('écran `relance` avec `/clear` puis `/coach-automatisation:coach`'), 'pause');
  assert.ok(skill.includes('reprendre plus tard') && skill.includes('écran `relance`'), 'arrêt en cours de route');
});

test('Mario suit le parcours : page partagée avec lui, résumé envoyé sur Cliq', () => {
  const lire = (f) => readFileSync(new URL(`../skills/${f}`, import.meta.url), 'utf8');
  const page = lire('coach/page.md');
  assert.ok(page.includes('Partage ta page avec Mario'), 'page.md : partage à la publication');
  assert.ok(page.includes('resume: "<Markdown>" | null'), 'page.md : résumé sur la relance');
  const skill = lire('coach/SKILL.md');
  assert.ok(skill.includes("Je l'envoie à Mario sur Cliq"), 'SKILL : carte de fin');
  assert.ok(skill.includes('`resume` = le Markdown de `resume`'), 'SKILL : résumé à la pause et à l\'arrêt');
  assert.ok(lire('progression/SKILL.md').includes('message Cliq'), 'progression : où envoyer le résumé');
});
