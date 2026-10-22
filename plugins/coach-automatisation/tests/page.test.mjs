import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const PAGE = fileURLToPath(new URL('../page/page.html', import.meta.url));
const lire = () => readFileSync(PAGE, 'utf8');

test('la page construite existe et porte un titre', () => {
  assert.ok(existsSync(PAGE), 'lancer node plugins/coach-automatisation/scripts/construire-page.mjs');
  assert.match(lire(), /<title>[^<]+<\/title>/);
});

test('la page ne charge rien d\'externe hormis Google Fonts', () => {
  const urls = lire().match(/https?:\/\/[^\s"')]+/g) || [];
  const etrangeres = urls.filter((u) => !/^https:\/\/fonts\.(googleapis|gstatic)\.com(\/|$)/.test(u));
  assert.deepEqual(etrangeres, []);
});

test('chaque script de la page est du JavaScript valide', () => {
  const scripts = [...lire().matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  assert.ok(scripts.length >= 1);
  for (const s of scripts) assert.doesNotThrow(() => new vm.Script(s));
});

test('la page ne contient ni tiret long ni marqueur oublié', () => {
  const html = lire();
  assert.ok(!html.includes('\u2014'));
  assert.ok(!html.includes('ACTIF:'));
  assert.ok(!html.includes('/*RENDU*/'));
  assert.doesNotMatch(html, /^\s*export\s/m);
});

test('la page pèse moins de 2 Mo', () => {
  assert.ok(statSync(PAGE).size < 2 * 1024 * 1024);
});

test('la page respecte le mouvement réduit et définit un thème sombre', () => {
  const html = lire();
  assert.ok(html.includes('@media (prefers-reduced-motion'));
  assert.ok(html.includes('prefers-color-scheme: dark'));
  assert.ok(html.includes(':root[data-theme="dark"]'));
});

test('la page s\'abonne à la base et sonne le coach', () => {
  const html = lire();
  assert.ok(html.includes('onSnapshot'));
  assert.ok(html.includes('sendToClaude'));
  assert.ok(html.includes('canSendToClaude'));
  assert.ok(html.includes('coach/ecran'));
  assert.ok(html.includes('page/presence'));
});

test('la police et les illustrations sont incluses dans la page', () => {
  const html = lire();
  assert.ok(html.includes('data:font/ttf;base64,'));
  assert.ok((html.match(/data:image\/png;base64,/g) || []).length >= 5);
});

test('le délai de silence laisse au coach au moins 4 minutes', () => {
  const m = /DELAI_SILENCE = (\d+)/.exec(lire());
  assert.ok(m, 'DELAI_SILENCE introuvable');
  assert.ok(Number(m[1]) >= 240000, `délai trop court : ${m[1]}`);
});

test('une page partagée en lecture seule suit le parcours sans alerte ni clic', () => {
  const html = lire();
  assert.ok(html.includes('dataset.lecture'), 'mode lecture détecté');
  assert.ok(html.includes('Lecture seule'), 'mode lecture visible');
  assert.match(html, /if \(lecture\) return;/, 'ni clic ni vérification du coach en lecture');
});
