// Règles du parcours. Fonctions pures : chaque fonction rend une copie, l'heure est toujours
// injectée par l'appelant.

export const PORTES = ['tache', 'idee', 'existante'];
export const RESULTATS = ['reussi', 'rate'];
export const FORMES_FINALES = ['routine-claude', 'flux-zoho', 'deluge', 'tache-poste', 'mini-appli'];
export const TITRES_FICHE = ['## Ce que ça fait', '## Déclencheur', '## Accès utilisés', '## Où ça tourne', '## Si ça casse'];
const DERNIERE_ETAPE = 8;
// Étape 3 : ça ne vaut pas le coup. Étape 4 : aucun déclencheur ne tient.
const ETAPES_ARRET = [3, 4];
// Texte du modèle de fiche resté tel quel : « <Deux ou trois phrases…> », « <prénom> ».
// Un lien « <https://…> » ou une comparaison « a < b » ne comptent pas.
const TEXTE_DU_MODELE = /<(?![a-z][a-z0-9+.-]*:)\p{L}[^<>]*>/iu;
const JOURS_AVANT_CONFIRMATION = 7;

export class ErreurParcours extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ErreurParcours';
    this.code = code;
  }
}

function dateLocale(d) {
  const deux = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())}`;
}

function enSlug(texte) {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function exigerEnCours(p) {
  if (p.statut !== 'en-cours') {
    throw new ErreurParcours('parcours-clos', `Ce parcours est clos (statut « ${p.statut} »), on ne peut plus le modifier.`);
  }
}

export function creerParcours({ titre, porte, installationRequise }, maintenant) {
  if (!titre || !titre.trim() || !enSlug(titre)) {
    throw new ErreurParcours('titre-manquant', 'Il faut un titre pour le parcours.');
  }
  if (!PORTES.includes(porte)) {
    throw new ErreurParcours('porte-inconnue', `Porte « ${porte} » inconnue. Portes possibles : ${PORTES.join(', ')}.`);
  }
  const iso = maintenant.toISOString();
  const etapes = {};
  for (let n = 0; n <= DERNIERE_ETAPE; n++) etapes[String(n)] = { statut: 'a-faire', valideeLe: null };
  if (!installationRequise) etapes['0'].statut = 'non-requise';
  return {
    version: 1,
    id: `${dateLocale(maintenant)}-${enSlug(titre)}`,
    titre: titre.trim(),
    porte,
    statut: 'en-cours',
    etapeCourante: installationRequise ? 0 : 1,
    etapes,
    concepts: {},
    arret: null,
    livraison: null,
    page: null,
    creeLe: iso,
    majLe: iso,
  };
}

export function validerEtape(p, etape, maintenant, notes) {
  exigerEnCours(p);
  if (etape !== p.etapeCourante) {
    throw new ErreurParcours(
      'etape-hors-ordre',
      `On ne peut pas valider l'étape ${etape} maintenant : l'étape attendue est l'étape ${p.etapeCourante}.`,
    );
  }
  if (etape === DERNIERE_ETAPE && !p.livraison) {
    throw new ErreurParcours('livraison-manquante', "L'étape 8 se valide après l'enregistrement de la livraison.");
  }
  const copie = structuredClone(p);
  const iso = maintenant.toISOString();
  copie.etapes[String(etape)] = { statut: 'validee', valideeLe: iso };
  // Synthèse de ce qui a été décidé, relue à la reprise après une coupure.
  if (typeof notes === 'string' && notes.trim()) copie.etapes[String(etape)].notes = notes.trim();
  copie.etapeCourante = etape + 1;
  if (etape === DERNIERE_ETAPE) copie.statut = 'livre';
  copie.majLe = iso;
  return copie;
}

export function noterCarte(p, conceptId, resultat, socle, maintenant) {
  exigerEnCours(p);
  if (!socle.some((c) => c.id === conceptId)) {
    throw new ErreurParcours('concept-inconnu', `Le concept « ${conceptId} » ne fait pas partie du socle.`);
  }
  if (!RESULTATS.includes(resultat)) {
    throw new ErreurParcours('resultat-inconnu', `Résultat « ${resultat} » inconnu. Résultats possibles : ${RESULTATS.join(', ')}.`);
  }
  const copie = structuredClone(p);
  const iso = maintenant.toISOString();
  const concept = copie.concepts[conceptId] ?? { essais: [], statut: 'en-cours' };
  concept.essais.push({ resultat, le: iso });
  const reussi = concept.essais.some((e) => e.resultat === 'reussi');
  const rates = concept.essais.filter((e) => e.resultat === 'rate').length;
  concept.statut = reussi ? 'acquis' : rates >= 2 ? 'a-revoir' : 'en-cours';
  copie.concepts[conceptId] = concept;
  copie.majLe = iso;
  return copie;
}

export function arreter(p, raison, maintenant) {
  exigerEnCours(p);
  if (!ETAPES_ARRET.includes(p.etapeCourante)) {
    throw new ErreurParcours(
      'arret-hors-etape',
      `On ne peut arrêter un parcours qu'à l'étape 3 (« Est-ce que ça vaut le coup ? ») ou à l'étape 4 si aucun déclencheur ne tient. Étape actuelle : ${p.etapeCourante}.`,
    );
  }
  if (!raison || !raison.trim()) {
    throw new ErreurParcours('raison-manquante', "Il faut dire pourquoi on arrête le parcours.");
  }
  const copie = structuredClone(p);
  const iso = maintenant.toISOString();
  copie.statut = 'arrete';
  copie.arret = { etape: p.etapeCourante, raison: raison.trim(), le: iso };
  copie.majLe = iso;
  return copie;
}

function sectionsVides(ficheContenu) {
  const lignes = ficheContenu.split(/\r?\n/).map((l) => l.trim());
  return TITRES_FICHE.filter((titre) => {
    const debut = lignes.indexOf(titre) + 1;
    const fin = lignes.findIndex((l, i) => i >= debut && /^#{1,2} /.test(l));
    return lignes.slice(debut, fin === -1 ? undefined : fin).every((l) => l === '');
  });
}

export function enregistrerLivraison(p, { forme, declencheur, fiche, ficheContenu }, maintenant) {
  exigerEnCours(p);
  if (p.etapeCourante !== DERNIERE_ETAPE) {
    throw new ErreurParcours(
      'livraison-hors-etape-8',
      `La livraison s'enregistre à l'étape 8 (fiche et registre). Étape actuelle : ${p.etapeCourante}.`,
    );
  }
  if (!declencheur || !declencheur.trim()) {
    throw new ErreurParcours(
      'declencheur-manquant',
      "Une automatisation livrée a forcément un déclencheur (un événement ou une heure fixe).",
    );
  }
  if (!FORMES_FINALES.includes(forme)) {
    throw new ErreurParcours(
      'forme-non-finale',
      `« ${forme} » n'est pas une forme de livraison finale (une skill ou un connecteur ne sont que des briques). Formes finales : ${FORMES_FINALES.join(', ')}.`,
    );
  }
  if (!fiche || !fiche.trim()) {
    throw new ErreurParcours('fiche-manquante', "Il faut le chemin de la fiche de l'automatisation.");
  }
  const lignes = new Set((ficheContenu ?? '').split(/\r?\n/).map((l) => l.trim()));
  const manquants = TITRES_FICHE.filter((t) => !lignes.has(t));
  if (manquants.length > 0) {
    throw new ErreurParcours('fiche-incomplete', `La fiche est incomplète. Titres manquants : ${manquants.join(', ')}.`);
  }
  const vides = sectionsVides(ficheContenu);
  const reste = ficheContenu.match(TEXTE_DU_MODELE);
  if (vides.length > 0 || reste) {
    const details = [];
    if (vides.length > 0) details.push(`Sections vides : ${vides.join(', ')}.`);
    if (reste) details.push(`Texte du modèle encore présent : « ${reste[0].replace(/\s+/g, ' ').slice(0, 60)} ».`);
    throw new ErreurParcours('fiche-non-remplie', `La fiche n'est pas remplie. ${details.join(' ')}`);
  }
  const copie = structuredClone(p);
  const iso = maintenant.toISOString();
  copie.livraison = { forme, declencheur: declencheur.trim(), fiche, livreLe: iso, fonctionnementConfirmeLe: null };
  copie.majLe = iso;
  return copie;
}

function joursCalendaires(debut, fin) {
  const jour = (d) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((jour(fin) - jour(debut)) / 86400000);
}

export function confirmerFonctionnement(p, maintenant) {
  if (!p.livraison) {
    throw new ErreurParcours('livraison-manquante', "Il n'y a pas encore d'automatisation livrée à confirmer.");
  }
  const ecoules = joursCalendaires(new Date(p.livraison.livreLe), maintenant);
  if (ecoules < JOURS_AVANT_CONFIRMATION) {
    const restants = JOURS_AVANT_CONFIRMATION - ecoules;
    throw new ErreurParcours(
      'trop-tot',
      `Trop tôt pour confirmer : l'automatisation doit tourner une semaine. Reviens dans ${restants} jour${restants > 1 ? 's' : ''}.`,
    );
  }
  const copie = structuredClone(p);
  const iso = maintenant.toISOString();
  copie.livraison.fonctionnementConfirmeLe = iso;
  copie.majLe = iso;
  return copie;
}

// Adresse de la page de l'atelier publiée sur claude.ai. La barre oblique finale est exigée :
// « https://claude.ai.evil.com/ » commence par « https://claude.ai » mais pas par « https://claude.ai/ ».
export function enregistrerPage(p, url) {
  if (typeof url !== 'string' || !url.startsWith('https://claude.ai/')) {
    throw new ErreurParcours('url-invalide', "L'adresse de la page doit commencer par https://claude.ai/.");
  }
  return { ...structuredClone(p), page: url };
}

function bilanConcepts(listeParcours, socle) {
  const acquis = [];
  const aRevoir = [];
  const pasVus = [];
  for (const c of socle) {
    const etats = listeParcours.map((p) => p.concepts[c.id]?.statut).filter(Boolean);
    if (etats.includes('acquis')) acquis.push(c);
    else if (etats.includes('a-revoir')) aRevoir.push(c);
    else pasVus.push(c);
  }
  return { acquis, aRevoir, pasVus };
}

export function calculerCriteres(listeParcours, socle, maintenant) {
  const { acquis } = bilanConcepts(listeParcours, socle);
  const acquisIds = new Set(acquis.map((c) => c.id));
  const manquants = socle.map((c) => c.id).filter((id) => !acquisIds.has(id));
  return {
    automatisationQuiTourne: listeParcours.some((p) => Boolean(p.livraison?.fonctionnementConfirmeLe)),
    socle: { ok: manquants.length === 0, manquants },
    ficheComplete: listeParcours.some((p) => Boolean(p.livraison)),
  };
}

export function resumer(listeParcours, socle, maintenant) {
  const ouiNon = (v) => (v ? 'oui' : 'non');
  const liste = (concepts) => (concepts.length ? concepts.map((c) => `- ${c.nom}`).join('\n') : '- aucun');
  const { acquis, aRevoir, pasVus } = bilanConcepts(listeParcours, socle);
  const criteres = calculerCriteres(listeParcours, socle, maintenant);
  const livrees = listeParcours.filter((p) => p.livraison);
  const lignesLivraisons = livrees.length
    ? livrees.map((p) => {
        const l = p.livraison;
        const confirme = l.fonctionnementConfirmeLe ? `confirmé le ${dateLocale(new Date(l.fonctionnementConfirmeLe))}` : 'pas encore confirmé';
        return `- ${p.titre} : ${l.forme}, déclencheur « ${l.declencheur} », livré le ${dateLocale(new Date(l.livreLe))}, fonctionnement ${confirme}`;
      }).join('\n')
    : '- aucune';
  const lignesParcours = listeParcours.length
    ? listeParcours.map((p) => {
        const ou = p.statut === 'en-cours' ? `étape ${p.etapeCourante}` : p.statut === 'arrete' ? `arrêté à l'étape ${p.arret.etape} (${p.arret.raison})` : 'livré';
        return `- ${p.titre} (porte ${p.porte}) : ${ou}`;
      }).join('\n')
    : '- aucun';
  return [
    `# Résumé de progression au ${dateLocale(maintenant)}`,
    '',
    '## Critères vers le niveau 3',
    '',
    `- Automatisation qui tourne depuis une semaine : ${ouiNon(criteres.automatisationQuiTourne)}`,
    `- Socle réussi : ${ouiNon(criteres.socle.ok)} (${socle.length - criteres.socle.manquants.length} concepts sur ${socle.length})`,
    `- Fiche complète : ${ouiNon(criteres.ficheComplete)}`,
    '',
    '## Concepts acquis',
    '',
    liste(acquis),
    '',
    '## À revoir',
    '',
    liste(aRevoir),
    '',
    '## Pas encore réussis',
    '',
    liste(pasVus),
    '',
    '## Livraisons',
    '',
    lignesLivraisons,
    '',
    '## Parcours',
    '',
    lignesParcours,
    '',
  ].join('\n');
}
