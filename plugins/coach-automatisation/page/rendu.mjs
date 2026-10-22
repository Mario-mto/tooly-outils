// Rendu de l'écran du coach : fonctions pures, de l'écran (document coach/ecran) et des réponses
// vers le HTML de la zone principale. Ce fichier est aussi inséré tel quel dans la page à la
// construction (scripts/construire-page.mjs retire les `export`) : aucun import, aucune dépendance.

export const NOMS_ETAPES = [
  'Installation', 'Porte d\'entrée', 'Décrire', 'Ça vaut le coup ?', 'Découper',
  'Choisir la forme', 'Construire', 'Tester', 'La fiche',
];

// Illustration de chaque étape (classes CSS du gabarit, images incluses à la construction).
const ILLUSTRATIONS = [
  'implementation', 'formation', 'analyse', 'analyse', 'migration',
  'implementation', 'migration', 'implementation', 'formation',
];

const LETTRES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const STATUTS = {
  'premier-coup': '✓ Du premier coup',
  'deuxieme-essai': '✓ Au deuxième essai',
  'a-revoir': '↻ À revoir',
};

const POINTS = '<span class="points" aria-hidden="true"><span></span><span></span><span></span></span>';

// Échappe tout texte venu du coach ; le tiret long, interdit partout, devient une virgule.
export function echapper(texte) {
  return String(texte ?? '')
    .replace(/\s*\u2014\s*/g, ', ')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Texte du coach avec ses adresses : chaque https:// devient un lien court (le nom du site) et un
// bouton qui copie l'adresse entière. Échappé d'abord : l'adresse s'arrête à tout guillemet.
const ADRESSE = /https:\/\/(?:(?!&quot;|&#39;|&lt;|&gt;)\S)+/g;

function avecLiens(texte) {
  return echapper(texte).replace(ADRESSE, (brut) => {
    const fin = /[.,;:!?)]+$/.exec(brut);
    const url = fin ? brut.slice(0, -fin[0].length) : brut;
    let site = 'le lien';
    try { site = new URL(url.replace(/&amp;/g, '&')).hostname; } catch { /* adresse illisible */ }
    return `<span class="lien-copie"><a class="lien" href="${url}" target="_blank" rel="noopener">${echapper(site)}</a><button class="copier" data-action="copier" data-texte="${url}">Copier le lien</button></span>${fin ? fin[0] : ''}`;
  });
}

function cleReponse(ecran, carteId) {
  return `${ecran.n}-${carteId}`;
}

function reponseDe(ecran, reponses, carteId) {
  return (reponses || {})[cleReponse(ecran, carteId)] || null;
}

function cartesDe(ecran) {
  return Array.isArray(ecran.cartes) ? ecran.cartes : [];
}

function toutesRepondues(ecran, reponses) {
  return cartesDe(ecran).every((c) => reponseDe(ecran, reponses, c.id));
}

function contientQuiz(ecran) {
  return cartesDe(ecran).some((c) => c.type === 'quiz');
}

function bandeauFait(ecran, reponses) {
  return Boolean(ecran.bandeau && reponseDe(ecran, reponses, `bandeau-${ecran.bandeau.id}`));
}

// La page sonne le coach une fois par écran (Continuer, bandeau, ou dernière carte d'un écran
// sans quiz), et en plus sur un quiz raté dont le mot du coach n'est pas encore écrit.
export function doitSonner(ecran, reponses, evenement) {
  if (!ecran || !evenement) return false;
  if (evenement.type === 'continuer' || evenement.type === 'bandeau') return true;
  if (evenement.type !== 'carte') return false;
  const carte = cartesDe(ecran).find((c) => c.id === evenement.carte);
  if (!carte) return false;
  if (carte.type === 'quiz') {
    return evenement.juste === false && ecran.type !== 'accueil' && !carte.motCoach;
  }
  return toutesRepondues(ecran, reponses) && !contientQuiz(ecran);
}

function etapeDe(ecran) {
  const e = Number(ecran.parcours && ecran.parcours.etape);
  return Number.isInteger(e) && e >= 0 && e <= 8 ? e : 0;
}

function illustration(nom) {
  return `<div class="illu illu-${nom}" aria-hidden="true"></div>`;
}

function haut(ecran) {
  const titre = ecran && ecran.parcours && ecran.parcours.titre;
  const parc = titre
    ? `Ton parcours : <b>${echapper(titre)}</b>`
    : 'Coach d\'automatisation';
  return `<header class="haut"><span class="logo" role="img" aria-label="Tooly"></span><div class="parc">${parc}</div></header>`;
}

function etapes(ecran) {
  const cur = etapeDe(ecran);
  const items = NOMS_ETAPES.map((nom, i) => {
    const etat = i < cur ? 'done' : i === cur ? 'cur' : 'todo';
    const marque = i < cur ? '✓' : String(i);
    const courant = i === cur ? ' aria-current="step"' : '';
    return `<li class="${etat}"${courant}><span class="n">${marque}</span><span class="lbl">${echapper(nom)}</span></li>`;
  }).join('');
  return `<ol class="etapes" aria-label="Progression">${items}</ol>`;
}

function verdictQuiz(carte, juste) {
  return juste
    ? `<div class="verdict"><b>Exactement.</b> ${avecLiens(carte.expliqueBonne)}</div>`
    : `<div class="verdict"><b>Pas tout à fait.</b> ${avecLiens(carte.expliqueFausse)}</div>`;
}

function motDuCoach(carte) {
  const contenu = carte.motCoach
    ? avecLiens(carte.motCoach)
    : `${POINTS}<span class="sr">Le coach écrit</span>`;
  return `<div class="coach" aria-live="polite"><div class="av">C</div><div class="bulle"><div class="qui">Le coach</div><div class="txt">${contenu}</div></div></div>`;
}

function carteQuiz(ecran, carte, rep) {
  const repondu = Boolean(rep);
  const options = (carte.options || []).map((o, i) => {
    const classes = ['opt'];
    if (repondu && o.bonne) classes.push('bonne');
    if (repondu && rep.choix === i && !o.bonne) classes.push('fausse');
    const off = repondu ? ' disabled' : '';
    return `<button class="${classes.join(' ')}" data-carte="${echapper(carte.id)}" data-index="${i}"${off}><span class="k">${LETTRES[i] || i + 1}</span><span>${echapper(o.texte)}</span></button>`;
  }).join('');
  const accueil = ecran.type === 'accueil';
  const tag = accueil ? 'Petit défi' : 'Carte · Vérifie que tu as compris';
  let suite = '';
  if (repondu && accueil) {
    const bonne = (carte.options || []).find((o) => o.bonne);
    const nombre = parseInt(bonne ? bonne.texte : '', 10) || 0;
    suite = `<div class="revele"><div class="gros" data-compteur="${nombre}">${nombre} h</div><p>${avecLiens(carte.expliqueBonne)}</p></div>`;
  } else if (repondu) {
    suite = verdictQuiz(carte, rep.juste === true);
    if (rep.juste === false) suite += motDuCoach(carte);
  }
  return `<section class="carte quiz${repondu ? ' fini' : ''}"><span class="tag">${tag}</span><h2>${echapper(carte.question)}</h2><div class="opts">${options}</div>${suite}</section>`;
}

function carteChoix(ecran, carte, rep) {
  const repondu = Boolean(rep);
  const options = (carte.options || []).map((o, i) => {
    const classes = ['opt'];
    if (repondu && rep.choix === i) classes.push('choisie');
    const off = repondu ? ' disabled' : '';
    const reco = i === 0 ? '<span class="reco">Recommandé</span>' : '';
    return `<button class="${classes.join(' ')}" data-carte="${echapper(carte.id)}" data-index="${i}"${off}><span class="k">${LETTRES[i] || i + 1}</span><span>${echapper(o.texte)}</span>${reco}</button>`;
  }).join('');
  return `<section class="carte choix${repondu ? ' fini' : ''}"><span class="tag clair">À toi de choisir</span><h2>${echapper(carte.question)}</h2><div class="opts">${options}</div></section>`;
}

function carteTexte(ecran, carte, rep) {
  const id = echapper(carte.id);
  const corps = rep
    ? `<blockquote class="envoye">${echapper(rep.texte)}</blockquote><p class="sub">Envoyé au coach.</p>`
    : `<textarea id="texte-${id}" data-carte="${id}" rows="4" placeholder="Écris ici, comme tu parlerais à un collègue."></textarea><button class="btn main" data-action="envoyer" data-carte="${id}">Envoyer</button>`;
  return `<section class="carte texte"><span class="tag clair">À toi d'écrire</span><h2><label for="texte-${id}">${echapper(carte.question)}</label></h2>${corps}</section>`;
}

function carte(ecran, c, reponses) {
  const rep = reponseDe(ecran, reponses, c.id);
  if (c.type === 'quiz') return carteQuiz(ecran, c, rep);
  if (c.type === 'texte') return carteTexte(ecran, c, rep);
  return carteChoix(ecran, c, rep);
}

function cartes(ecran, reponses) {
  return cartesDe(ecran).map((c) => carte(ecran, c, reponses)).join('');
}

function attenteCoach() {
  return `<div class="reflechit" aria-live="polite">${POINTS}<span>Le coach prépare la suite.</span></div>`;
}

function boutonContinuer(libelle) {
  return `<div class="suite"><button class="btn main" data-action="continuer">${libelle}</button></div>`;
}

// Bas de la zone principale : Continuer, ou l'attente du coach une fois qu'on l'a sonné.
function suite(ecran, reponses) {
  const continue_ = Boolean(reponseDe(ecran, reponses, 'continuer'));
  const nb = cartesDe(ecran).length;
  const toutes = toutesRepondues(ecran, reponses);
  if (continue_ || bandeauFait(ecran, reponses) || (nb > 0 && toutes && !contientQuiz(ecran))) {
    return attenteCoach();
  }
  if (ecran.bandeau) return '';
  if (nb === 0 || toutes) return boutonContinuer('Continuer →');
  return '';
}

// Une commande à taper dans la fenêtre de Claude Code, avec son bouton Copier.
function aTaper(commande) {
  if (!commande) return '';
  return `<span class="a-taper"><code>${echapper(commande)}</code><button class="copier" data-action="copier" data-texte="${echapper(commande)}">Copier</button></span>`;
}

function bandeau(ecran, reponses) {
  const b = ecran.bandeau;
  if (!b || bandeauFait(ecran, reponses)) return '';
  const commande = aTaper(b.aTaper);
  return `<div class="bandeau" role="region" aria-label="À faire dans Claude Code"><div class="ico" aria-hidden="true">&gt;_</div><p>${echapper(b.texte)} ${commande}</p><button class="ok" data-action="bandeau" data-bandeau="${echapper(b.id)}">C'est fait</button></div>`;
}

function pourTaTache(ecran) {
  const p = ecran.pourTaTache;
  if (!p || !Array.isArray(p.lignes) || p.lignes.length === 0) return '';
  const lignes = p.lignes.map((l) => `<div><b>${echapper(l.label)}</b><span>${avecLiens(l.valeur)}</span></div>`).join('');
  const verdict = p.verdict ? `<span class="verdict-tache">✓ ${echapper(p.verdict)}</span>` : '';
  return `<section class="carte"><h2>Pour ta tâche</h2><div class="sub">D'après ce que tu m'as décrit</div><div class="crit">${lignes}</div>${verdict}</section>`;
}

function enveloppe(ecran, type, corps, reponses) {
  return `<div class="ecran ecran-${type}" data-ecran="${type}" data-n="${Number(ecran.n) || 0}">${corps}${bandeau(ecran, reponses)}</div>`;
}

function rendreAttente() {
  const corps = `${haut(null)}<div class="attente">${illustration('formation')}<h1>Le coach prépare ton écran</h1><p class="lead">${POINTS}</p><p class="lead">Garde cette page ouverte : elle se met à jour toute seule.</p></div>`;
  return `<div class="ecran ecran-attente" data-ecran="attente" data-n="0">${corps}</div>`;
}

// Le résumé que l'employé copie et envoie lui-même à Mario (fin, pause, arrêt).
function blocResume(texte) {
  if (!texte) return '';
  return `<section class="carte sombre resume"><h2>Le résumé pour Mario</h2><p>Copie-le et colle-le dans un message Cliq à Mario : c'est comme ça qu'il suit où tu en es.</p><pre>${echapper(texte)}</pre><button class="btn jaune" data-action="copier" data-texte="${echapper(texte)}">Copier le résumé</button></section>`;
}

// Le coach est coupé (/clear, relance, pause) : la page dit quoi taper, dans l'ordre. Pas de
// Continuer ni de C'est fait : personne n'écoute avant la reprise, qui réécrit l'écran.
const COULEURS = ['jaune', 'aqua', 'rose'];

function rendreRelance(ecran, reponses) {
  const commandes = Array.isArray(ecran.commandes) ? ecran.commandes : [];
  const liste = commandes.map((c, i) => `<li><span class="ic ${COULEURS[i % 3]}">${i + 1}</span><div><p>${avecLiens(c.texte)}</p>${aTaper(c.aTaper)}</div></li>`).join('');
  const corps = `${haut(ecran)}<div class="attente relance">${illustration('formation')}<span class="tag">À faire dans la fenêtre de Claude Code</span><h1>${echapper(ecran.titre)}</h1><p class="lead">${avecLiens(ecran.explication)}</p><ol class="relance-liste">${liste}</ol><p class="lead">Ta progression est sauvegardée. Garde cette page ouverte : quand le coach revient, elle reprend toute seule.</p><p class="rappel">Pour voir où tu en es à tout moment, tape ${aTaper('/coach-automatisation:progression')}</p>${blocResume(ecran.resume)}</div>`;
  return enveloppe(ecran, 'relance', corps, reponses);
}

function rendreAccueil(ecran, reponses) {
  const fini = toutesRepondues(ecran, reponses) && cartesDe(ecran).length > 0;
  const promesse = fini
    ? `<div class="promesse"><div><span class="ic jaune">1</span>Aujourd'hui, on en récupère une.</div><div><span class="ic aqua">2</span>Je construis, toi tu comprends pourquoi.</div><div><span class="ic rose">3</span>Tu repars avec l'outil et le savoir-faire.</div></div>`
    : '';
  const bas = fini ? (reponseDe(ecran, reponses, 'continuer') ? attenteCoach() : boutonContinuer('On commence →')) : '';
  const corps = `${haut(ecran)}<div class="accueil"><div><h1>${echapper(ecran.titre)}</h1><p class="lead">${avecLiens(ecran.explication)}</p>${cartes(ecran, reponses)}${promesse}${bas}</div>${illustration('formation')}</div>`;
  return enveloppe(ecran, 'accueil', corps, reponses);
}

function rendreEtape(ecran, reponses) {
  const e = etapeDe(ecran);
  const cote = `<aside class="cote">${illustration(ILLUSTRATIONS[e])}<div class="surtitre">Étape ${e} sur 8 · ${echapper(NOMS_ETAPES[e])}</div><h1>${echapper(ecran.titre)}</h1><p class="lead">${avecLiens(ecran.explication)}</p></aside>`;
  const principal = `<div class="principal">${pourTaTache(ecran)}${cartes(ecran, reponses)}${suite(ecran, reponses)}</div>`;
  return enveloppe(ecran, 'etape', `${haut(ecran)}${etapes(ecran)}<div class="grille">${cote}${principal}</div>`, reponses);
}

function rendreTravail(ecran, reponses) {
  const e = etapeDe(ecran);
  const chrome = e === 6
    ? '<div class="chrome"><div class="oeil" aria-hidden="true">👀</div><div><b>Ouvre ton onglet Chrome.</b><br><span>Je n\'y tape jamais de mot de passe. Si on t\'en demande un, c\'est toi qui le tapes.</span></div></div>'
    : '';
  const lignes = (ecran.travail || []).map((l) => {
    const etat = ['fait', 'en-cours', 'a-faire'].includes(l.etat) ? l.etat : 'a-faire';
    const marque = etat === 'fait' ? '✓' : '';
    return `<li class="${etat}"><span class="st" aria-hidden="true">${marque}</span>${avecLiens(l.texte)}</li>`;
  }).join('');
  const notes = ((ecran.pourTaTache && ecran.pourTaTache.lignes) || []).map((l, i) => {
    const entete = i === 0
      ? `<div class="pense"><div class="av">C</div><div><b>Le coach</b><br>${POINTS}</div></div>`
      : '<span class="pill">Tu te souviens ?</span>';
    return `<section class="carte">${entete}<h3>${echapper(l.label)}</h3><p>${avecLiens(l.valeur)}</p></section>`;
  }).join('');
  const gauche = `<div><span class="tag">Étape ${e} · ${echapper(NOMS_ETAPES[e])}</span><h1>${echapper(ecran.titre)}</h1><p class="lead">${avecLiens(ecran.explication)}</p>${chrome}<ol class="todo">${lignes}</ol>${cartes(ecran, reponses)}${cartesDe(ecran).length ? suite(ecran, reponses) : ''}</div>`;
  return enveloppe(ecran, 'travail', `${haut(ecran)}${etapes(ecran)}<div class="travail">${gauche}<div class="notes">${notes}</div></div>`, reponses);
}

function rendreValidee(ecran, reponses) {
  const e = etapeDe(ecran);
  const v = ecran.validee || { concepts: [], suivante: null };
  const appris = (v.concepts || []).map((c) => {
    const statut = STATUTS[c.statut] ? c.statut : 'premier-coup';
    return `<section class="carte"><span class="pill ${statut}">${STATUTS[statut]}</span><h3>${echapper(c.nom)}</h3><p>${echapper(c.definition)}</p></section>`;
  }).join('');
  const de = Math.round((e / 9) * 100);
  const a = Math.round(((e + 1) / 9) * 100);
  const suivante = v.suivante
    ? `<div class="ensuite">Ensuite<b>Étape ${Math.min(e + 1, 8)} · ${echapper(v.suivante)}</b></div>`
    : '';
  const bouton = reponseDe(ecran, reponses, 'continuer') ? attenteCoach() : '<button class="btn main" data-action="continuer">Continuer →</button>';
  const corps = `${haut(ecran)}<div class="victoire"><div class="confettis" aria-hidden="true"></div><div class="badge" aria-hidden="true">✓</div><h1>${echapper(ecran.titre)}</h1><p class="lead">${avecLiens(ecran.explication)}</p><div class="appris">${appris}</div><div class="barre">${suivante}<div class="piste"><div class="rempli" style="--de:${de}%;--a:${a}%"></div></div>${bouton}</div></div>`;
  return enveloppe(ecran, 'validee', corps, reponses);
}

function rendreFin(ecran, reponses) {
  const f = ecran.fin || { construit: null, concepts: [], resume: '' };
  const construit = Array.isArray(f.construit)
    ? `<section class="carte"><h2>Ce que tu as construit</h2><div class="faits">${f.construit.map((l) => `<div><b>${echapper(l.label)}</b>${echapper(l.valeur)}</div>`).join('')}</div><div class="semaine"><div class="cal">+7</div><div><b>Rendez-vous dans 7 jours.</b> Relance le coach et dis-moi si ça a bien marché : c'est ce qui fait compter ton automatisation.</div></div></section>`
    : '';
  const concepts = f.concepts || [];
  const acquis = concepts.filter((c) => c.statut !== 'a-revoir').length;
  const liste = concepts.map((c) => `<span${c.statut === 'a-revoir' ? ' class="rev"' : ''}>${echapper(c.nom)}</span>`).join('');
  const appris = `<section class="carte"><h2>Ce que tu as appris</h2><div class="score"><span class="nb">${acquis}</span><span>concepts sur ${concepts.length} acquis</span></div><div class="concepts">${liste}</div></section>`;
  const resume = blocResume(f.resume);
  const corps = `${haut(ecran)}<div class="fin"><div class="tete">${illustration('implementation')}<div><span class="tag">Parcours terminé</span><h1>${echapper(ecran.titre)}</h1><p class="lead">${avecLiens(ecran.explication)}</p></div></div>${construit}${appris}${resume}<div class="fin-cartes">${cartes(ecran, reponses)}${cartesDe(ecran).length ? suite(ecran, reponses) : ''}</div></div>`;
  return enveloppe(ecran, 'fin', corps, reponses);
}

const RENDUS = {
  accueil: rendreAccueil,
  etape: rendreEtape,
  travail: rendreTravail,
  validee: rendreValidee,
  fin: rendreFin,
  relance: rendreRelance,
};

export function rendreEcran(ecran, reponses) {
  const rendu = ecran && RENDUS[ecran.type];
  if (!rendu) return rendreAttente();
  return rendu(ecran, reponses || {});
}
