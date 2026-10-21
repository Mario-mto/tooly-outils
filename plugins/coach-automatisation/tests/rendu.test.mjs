import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rendreEcran, echapper, doitSonner, NOMS_ETAPES } from '../page/rendu.mjs';
import { ACCUEIL, ETAPE, TRAVAIL, BANDEAU, VALIDEE, FIN, ATTENTE, QUIZ, CHOIX, TEXTE } from './ecrans-exemples.mjs';

const TIRET_LONG = '\u2014';
const compter = (texte, motif) => texte.split(motif).length - 1;
const reponse = (ecran, carte, champs) => ({ [`${ecran.n}-${carte}`]: { ecran: ecran.n, carte, le: '2026-10-22T13:00:00Z', ...champs } });

test('echapper neutralise les caractères HTML', () => {
  assert.equal(echapper('<b>&"'), '&lt;b&gt;&amp;&quot;');
  assert.equal(echapper(null), '');
});

test('NOMS_ETAPES nomme les neuf étapes', () => {
  assert.equal(NOMS_ETAPES.length, 9);
  assert.equal(NOMS_ETAPES[0], 'Installation');
  assert.equal(NOMS_ETAPES[3], 'Ça vaut le coup ?');
  assert.equal(NOMS_ETAPES[8], 'La fiche');
});

test('un quiz sans réponse montre la question et quatre options, sans la correction', () => {
  const html = rendreEcran(ETAPE, {});
  assert.ok(html.includes(echapper(QUIZ.question)));
  assert.equal(compter(html, 'data-carte="quiz-valeur"'), 4);
  assert.ok(!html.includes(echapper(QUIZ.expliqueBonne)));
});

test('un quiz juste montre l\'explication et marque la bonne option', () => {
  const html = rendreEcran(ETAPE, reponse(ETAPE, 'quiz-valeur', { choix: 1, juste: true }));
  assert.ok(html.includes(echapper(QUIZ.expliqueBonne)));
  assert.match(html, /class="[^"]*\bbonne\b/);
  assert.ok(html.includes('disabled'));
});

test('un quiz faux sans mot du coach montre que le coach écrit', () => {
  const html = rendreEcran(ETAPE, reponse(ETAPE, 'quiz-valeur', { choix: 0, juste: false }));
  assert.ok(html.includes(echapper(QUIZ.expliqueFausse)));
  assert.match(html, /class="[^"]*\bfausse\b/);
  assert.match(html, /le coach écrit/i);
});

test('un quiz faux avec mot du coach affiche le mot, échappé', () => {
  const ecran = { ...ETAPE, cartes: [{ ...QUIZ, motCoach: 'Pense à ton rapport <du lundi> & au client.' }] };
  const html = rendreEcran(ecran, reponse(ecran, 'quiz-valeur', { choix: 0, juste: false }));
  assert.ok(html.includes('Pense à ton rapport &lt;du lundi&gt; &amp; au client.'));
  assert.doesNotMatch(html, /le coach écrit/i);
});

test('le bouton Continuer n\'apparaît qu\'une fois toutes les cartes répondues', () => {
  assert.ok(!rendreEcran(ETAPE, {}).includes('data-action="continuer"'));
  const html = rendreEcran(ETAPE, reponse(ETAPE, 'quiz-valeur', { choix: 1, juste: true }));
  assert.ok(html.includes('data-action="continuer"'));
});

test('Continuer déjà cliqué : le bouton laisse place à l\'attente du coach', () => {
  const reponses = { ...reponse(ETAPE, 'quiz-valeur', { choix: 1, juste: true }), [`${ETAPE.n}-continuer`]: { ecran: ETAPE.n, continuer: true } };
  const html = rendreEcran(ETAPE, reponses);
  assert.ok(!html.includes('data-action="continuer"'));
  assert.match(html, /le coach prépare la suite/i);
});

test('le bloc pour ta tâche affiche les critères et le verdict', () => {
  const html = rendreEcran(ETAPE, {});
  assert.ok(html.includes('Fréquence'));
  assert.ok(html.includes('Ça vaut le coup'));
});

test('l\'en-tête nomme l\'étape en cours et le parcours', () => {
  const html = rendreEcran(ETAPE, {});
  assert.ok(html.includes('Étape 3 sur 8'));
  assert.ok(html.includes(echapper('Ça vaut le coup ?')));
  assert.ok(html.includes('Rapport hebdo des retards Zoho'));
});

test('une carte de choix met la recommandée en premier et marque l\'option choisie', () => {
  const ecran = { ...ETAPE, cartes: [CHOIX] };
  assert.match(rendreEcran(ecran, {}), /Recommandé/);
  const html = rendreEcran(ecran, reponse(ecran, 'temps', { choix: 1 }));
  assert.match(html, /class="[^"]*\bchoisie\b/);
});

test('une carte texte offre une zone et un bouton Envoyer, puis montre le texte envoyé', () => {
  const ecran = { ...ETAPE, cartes: [TEXTE] };
  const vide = rendreEcran(ecran, {});
  assert.ok(vide.includes('<textarea'));
  assert.ok(vide.includes('data-action="envoyer"'));
  const html = rendreEcran(ecran, reponse(ecran, 'description', { texte: 'Je compile <les retards>' }));
  assert.ok(!html.includes('<textarea'));
  assert.ok(html.includes('Je compile &lt;les retards&gt;'));
});

test('un écran travail rend une ligne par action avec la classe de son état', () => {
  const html = rendreEcran(TRAVAIL, {});
  assert.equal(compter(html, '<li class="fait"'), 1);
  assert.equal(compter(html, '<li class="en-cours"'), 1);
  assert.equal(compter(html, '<li class="a-faire"'), 1);
  assert.match(html, /Chrome/);
  assert.match(html, /mot de passe/);
});

test('le bandeau montre le texte à taper et C\'est fait, puis disparaît une fois fait', () => {
  const html = rendreEcran(BANDEAU, {});
  assert.ok(html.includes('/chrome'));
  assert.ok(html.includes('data-bandeau="chrome"'));
  assert.ok(html.includes('data-action="copier"'));
  const fait = rendreEcran(BANDEAU, { [`${BANDEAU.n}-bandeau-chrome`]: { ecran: BANDEAU.n, bandeau: 'chrome', fait: true } });
  assert.ok(!fait.includes('data-bandeau="chrome"'));
});

test('l\'écran validé montre les concepts avec leur statut et Continuer', () => {
  const html = rendreEcran(VALIDEE, {});
  assert.match(html, /Du premier coup/);
  assert.match(html, /Au deuxième essai/);
  assert.match(html, /À revoir/);
  assert.ok(html.includes('Découper'));
  assert.ok(html.includes('data-action="continuer"'));
});

test('l\'écran de fin compte les concepts acquis et montre le résumé', () => {
  const html = rendreEcran(FIN, {});
  assert.match(html, /2<\/span>\s*<span>concepts sur 3 acquis/);
  assert.match(html, /class="rev"/);
  assert.ok(html.includes('Flux Zoho Flow'));
  assert.ok(html.includes('data-action="copier"'));
  const sec = rendreEcran({ ...FIN, fin: { ...FIN.fin, construit: null } }, {});
  assert.ok(!sec.includes('Ce que tu as construit'));
});

test('l\'accueil pose le défi puis montre la promesse et On commence', () => {
  const avant = rendreEcran(ACCUEIL, {});
  assert.ok(avant.includes('data-carte="defi"'));
  assert.ok(!avant.includes('data-action="continuer"'));
  const apres = rendreEcran(ACCUEIL, reponse(ACCUEIL, 'defi', { choix: 0, juste: false }));
  assert.ok(apres.includes('data-compteur="40"'));
  assert.ok(apres.includes('data-action="continuer"'));
  assert.doesNotMatch(apres, /le coach écrit/i);
});

test('un écran sans type connu, ou absent, rend l\'écran d\'attente', () => {
  assert.match(rendreEcran({ n: 4, type: 'inconnu' }, {}), /data-ecran="attente"/);
  assert.match(rendreEcran(null, {}), /data-ecran="attente"/);
  assert.match(rendreEcran(ATTENTE, null), /data-ecran="attente"/);
});

test('un texte du coach avec balise n\'est jamais interprété', () => {
  const html = rendreEcran({ ...ETAPE, titre: '<img src=x onerror=alert(1)>' }, {});
  assert.ok(!html.includes('<img src=x'));
});

test('aucun rendu ne contient de tiret long, même si le coach en écrit un', () => {
  const piege = { ...ETAPE, explication: `Avant ${TIRET_LONG} après` };
  for (const ecran of [ACCUEIL, ETAPE, TRAVAIL, BANDEAU, VALIDEE, FIN, ATTENTE, piege]) {
    assert.ok(!rendreEcran(ecran, {}).includes(TIRET_LONG), `écran ${ecran.type}`);
  }
});

test('doitSonner : une sonnerie par écran, plus le mot du coach sur un quiz raté', () => {
  const juste = reponse(ETAPE, 'quiz-valeur', { choix: 1, juste: true });
  const faux = reponse(ETAPE, 'quiz-valeur', { choix: 0, juste: false });
  assert.equal(doitSonner(ETAPE, juste, { type: 'carte', carte: 'quiz-valeur', juste: true }), false);
  assert.equal(doitSonner(ETAPE, faux, { type: 'carte', carte: 'quiz-valeur', juste: false }), true);
  assert.equal(doitSonner(ETAPE, juste, { type: 'continuer' }), true);
  assert.equal(doitSonner(BANDEAU, {}, { type: 'bandeau' }), true);
});

test('doitSonner : pas de mot du coach à l\'accueil ni s\'il est déjà écrit', () => {
  const faux = reponse(ACCUEIL, 'defi', { choix: 0, juste: false });
  assert.equal(doitSonner(ACCUEIL, faux, { type: 'carte', carte: 'defi', juste: false }), false);
  const ecrit = { ...ETAPE, cartes: [{ ...QUIZ, motCoach: 'Déjà écrit.' }] };
  assert.equal(doitSonner(ecrit, reponse(ecrit, 'quiz-valeur', { choix: 0, juste: false }), { type: 'carte', carte: 'quiz-valeur', juste: false }), false);
});

test('doitSonner : un choix ou un texte sonne quand il complète un écran sans quiz', () => {
  const ecran = { ...ETAPE, cartes: [CHOIX, TEXTE] };
  const un = reponse(ecran, 'temps', { choix: 0 });
  assert.equal(doitSonner(ecran, un, { type: 'carte', carte: 'temps' }), false);
  const deux = { ...un, ...reponse(ecran, 'description', { texte: 'ma tâche' }) };
  assert.equal(doitSonner(ecran, deux, { type: 'carte', carte: 'description' }), true);
  const avecQuiz = { ...ETAPE, cartes: [QUIZ, CHOIX] };
  const tout = { ...reponse(avecQuiz, 'quiz-valeur', { choix: 1, juste: true }), ...reponse(avecQuiz, 'temps', { choix: 0 }) };
  assert.equal(doitSonner(avecQuiz, tout, { type: 'carte', carte: 'temps' }), false);
});
