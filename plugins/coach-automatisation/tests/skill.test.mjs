import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { sep } from 'node:path';

const SKILLS = new URL('../skills/', import.meta.url);
const lire = (f) => readFileSync(new URL(f, SKILLS), 'utf8');
const skill = () => lire('coach/SKILL.md');
const installation = () => lire('coach/etapes/0-installation.md');

// La phrase de préparation, telle que le README de tooly-outils la donne.
const PHRASE = 'Prépare mon poste pour le coach d\'automatisation de Tooly : lis mot pour mot la procédure https://raw.githubusercontent.com/Mario-mto/tooly-outils/main/PREPARER.md (avec curl) et suis-la. Réponds en français et tutoie-moi.';

// Texte entre deux titres de niveau 2 (ou jusqu'à la fin).
const section = (texte, titre) => {
  const debut = texte.indexOf(`## ${titre}`);
  assert.ok(debut >= 0, `section ${titre}`);
  const fin = texte.indexOf('\n## ', debut + 3);
  return texte.slice(debut, fin < 0 ? undefined : fin);
};

test('le coach parle de lui au masculin et jamais en anglais', () => {
  const s = skill();
  assert.ok(s.includes('au masculin'), 'règle du masculin');
  assert.ok(s.includes('anglais'), 'règle : aucun message en anglais');
});

test('sans Node, le coach s\'arrête et donne la phrase de préparation', () => {
  const verifier = section(skill(), 'Vérifier le poste');
  assert.ok(verifier.includes(PHRASE), 'phrase de préparation entière, mot pour mot');
  assert.ok(verifier.includes('Node est introuvable : arrête-toi, ni page ni parcours'), 'arrêt sans Node');
  assert.ok(verifier.includes('redémarr'), 'redémarrage annoncé');
  assert.ok(verifier.includes('nouvelle conversation de l\'onglet Code'), 'où coller la phrase');
});

test('le démarrage renvoie à la vérification du poste', () => {
  const demarrage = section(skill(), 'Démarrage');
  const point2 = demarrage.slice(demarrage.indexOf('\n2. '), demarrage.indexOf('\n3. '));
  assert.ok(point2.includes('Lance `liste`'), 'c\'est bien le point 2');
  assert.ok(point2.replace(/\s+/g, ' ').includes('fais d\'abord « Vérifier le poste »'), point2);
});

test('carte de l\'extension : quatre options, dont le redémarrage déjà fait', () => {
  const verifier = section(skill(), 'Vérifier le poste');
  for (const option of [
    '« Je ne l\'ai pas installée »',
    '« Elle est installée mais Claude ne la voit pas »',
    '« J\'ai déjà redémarré, elle reste invisible »',
    '« Je n\'ai pas Chrome »',
  ]) assert.ok(verifier.includes(option), option);
  assert.ok(verifier.includes('pas de deuxième redémarrage'));
});

test('étape 0 en reprise : Chrome revérifié sans carte', () => {
  const etape = installation();
  assert.ok(etape.includes('ToolSearch') && etape.includes('tabs_context_mcp'));
  assert.ok(etape.includes('sans carte'));
});

test('sans terminal, le coach continue comme avant', () => {
  assert.ok(skill().includes('je ne peux pas sauvegarder ta progression pour l\'instant'));
});

test('la vérification du poste vient avant la page', () => {
  const s = skill();
  const verification = s.indexOf('tabs_context_mcp');
  const page = s.indexOf('Publier la page');
  assert.ok(verification >= 0, 'tabs_context_mcp dans SKILL.md');
  assert.ok(page >= 0, 'Publier la page dans SKILL.md');
  assert.ok(verification < page, 'la vérification du poste passe avant la publication de la page');
});

test('extension invisible : redémarrage complet', () => {
  const texte = 'Elle est installée mais Claude ne la voit pas';
  assert.ok(skill().includes(texte) || installation().includes(texte));
});

test('extension invisible : connecteur et organisation avant le redémarrage, jamais /chrome', () => {
  const verifier = section(skill(), 'Vérifier le poste').replace(/\s+/g, ' ');
  const debut = verifier.indexOf('« Elle est installée mais Claude ne la voit pas »');
  const option = verifier.slice(debut, verifier.indexOf('« J\'ai déjà redémarré', debut));
  assert.ok(option.includes('Personnaliser, Connecteurs, Claude in Chrome'), 'chemin du connecteur');
  assert.ok(option.includes('même organisation'), 'organisation de l\'extension');
  assert.ok(option.indexOf('Connecteurs') < option.indexOf('redémarrage complet'), 'réglages avant redémarrage');
  const deja = verifier.slice(verifier.indexOf('« J\'ai déjà redémarré'), verifier.indexOf('« Je n\'ai pas Chrome »'));
  assert.ok(deja.includes('Connecteurs') && deja.includes('même organisation'), 'aussi après un redémarrage');
  assert.ok(verifier.includes('`/chrome` n\'existe pas dans l\'application Claude'), 'pas de /chrome');
});

test('aucun tiret long dans le skill', () => {
  const fichiers = readdirSync(SKILLS, { recursive: true }).filter((f) => f.endsWith('.md'));
  assert.ok(fichiers.length >= 10);
  for (const f of fichiers) {
    assert.ok(!lire(f.split(sep).join('/')).includes(String.fromCodePoint(0x2014)), f);
  }
});

test('sans terminal, la vérification du poste est sautée', () => {
  const verifier = section(skill(), 'Vérifier le poste').replace(/\s+/g, ' ');
  assert.ok(verifier.includes('Sans outil de terminal'), 'cas nommé');
  assert.ok(verifier.includes('cette vérification est sautée, ni carte Node ni carte Extension'), verifier);
  assert.ok(verifier.includes("l'étape 0 revérifiera l'extension"));
  const demarrage = section(skill(), 'Démarrage').replace(/\s+/g, ' ');
  assert.ok(demarrage.includes("Impossible faute d'outil de terminal : saute cette vérification"));
});

test("le bouton de permission s'appelle Autoriser, partout", () => {
  const tout = readdirSync(SKILLS, { recursive: true }).filter((f) => f.endsWith('.md'))
    .map((f) => lire(f.split(sep).join('/'))).join('\n');
  assert.ok(!/« Yes|réponds Yes|ask again/.test(tout), 'plus de libellé anglais de permission');
  assert.ok(lire('coach/permissions.md').includes('« Autoriser »'));
});
