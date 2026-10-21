// Écrans d'exemple, un par type, partagés par les tests de rendu et le contrôle visuel de la page.

export const QUIZ = {
  id: 'quiz-valeur',
  type: 'quiz',
  question: 'Imagine : ta tâche revient une fois par an et prend 5 minutes. Qu\'est-ce qui ferait changer l\'avis ?',
  options: [
    { texte: 'Qu\'elle soit faite par quelqu\'un d\'autre', bonne: false },
    { texte: 'Une erreur qui coûterait cher', bonne: true },
    { texte: 'Un outil plus moderne', bonne: false },
    { texte: 'Qu\'elle soit vraiment ennuyeuse', bonne: false },
  ],
  expliqueBonne: 'Une tâche rare peut valoir le coup si une erreur coûte cher : une pénalité, un client perdu.',
  expliqueFausse: 'La bonne réponse est B : une tâche rare peut valoir le coup si une erreur coûte cher.',
  motCoach: null,
};

export const CHOIX = {
  id: 'temps',
  type: 'choix',
  question: 'Combien de temps as-tu devant toi ?',
  options: [
    { texte: 'Une heure, on va au bout', bonne: false },
    { texte: 'Vingt minutes, on fait les premières étapes', bonne: false },
  ],
  expliqueBonne: null,
  expliqueFausse: null,
  motCoach: null,
};

export const TEXTE = {
  id: 'description',
  type: 'texte',
  question: 'Décris ta tâche comme tu la ferais à un collègue.',
  options: [],
  expliqueBonne: null,
  expliqueFausse: null,
  motCoach: null,
};

const PARCOURS = { titre: 'Rapport hebdo des retards Zoho', etape: 3 };

export const ACCUEIL = {
  n: 1,
  type: 'accueil',
  parcours: { titre: null, etape: 0 },
  titre: 'Bonjour, on récupère du temps ?',
  explication: 'Avant de commencer, un petit défi. Réponds au jugé, il n\'y a pas de piège.',
  pourTaTache: null,
  cartes: [{
    id: 'defi',
    type: 'quiz',
    question: 'Une tâche de 10 minutes par jour, ça te coûte combien par an ?',
    options: [
      { texte: '10 h', bonne: false },
      { texte: '20 h', bonne: false },
      { texte: '40 h', bonne: true },
      { texte: '80 h', bonne: false },
    ],
    expliqueBonne: 'Environ 40 heures : une semaine de travail entière, chaque année, pour une seule petite tâche.',
    expliqueFausse: 'Environ 40 heures : une semaine de travail entière, chaque année, pour une seule petite tâche.',
    motCoach: null,
  }],
  travail: [],
  bandeau: null,
  validee: null,
  fin: null,
};

export const ETAPE = {
  n: 7,
  type: 'etape',
  parcours: PARCOURS,
  titre: 'Est-ce que ça vaut le coup ?',
  explication: 'Une automatisation coûte : la construire, la tester, l\'entretenir. Elle ne rapporte que si la tâche revient souvent, prend du temps ou coûte cher quand elle rate.',
  pourTaTache: {
    lignes: [
      { label: 'Fréquence', valeur: 'Chaque lundi, 52 fois par an' },
      { label: 'Temps', valeur: '25 min, soit 22 h par an' },
      { label: 'Si ça rate', valeur: 'Un client apprend le retard avant toi' },
      { label: 'Déclencheur', valeur: 'Lundi, 8 h' },
    ],
    verdict: 'Ça vaut le coup',
  },
  cartes: [QUIZ],
  travail: [],
  bandeau: null,
  validee: null,
  fin: null,
};

export const TRAVAIL = {
  n: 12,
  type: 'travail',
  parcours: { titre: PARCOURS.titre, etape: 6 },
  titre: 'Je construis ton flux. Regarde-moi faire.',
  explication: 'Tout se passe dans ton Chrome, avec ton compte Zoho. Observe, et lis à côté pourquoi je fais comme ça.',
  pourTaTache: {
    lignes: [
      { label: 'Pourquoi un déclencheur à heure fixe ?', valeur: 'Ton rapport doit partir chaque lundi, qu\'il y ait des retards ou non.' },
      { label: 'Entrées et sorties', valeur: 'Entrée : les tâches en retard. Sortie : un message dans Cliq.' },
    ],
    verdict: null,
  },
  cartes: [],
  travail: [
    { texte: 'Ouvrir Zoho Flow dans ton Chrome', etat: 'fait' },
    { texte: 'Programmer le déclencheur : chaque lundi, 8 h', etat: 'en-cours' },
    { texte: 'Laisser le flux désactivé : on teste d\'abord', etat: 'a-faire' },
  ],
  bandeau: null,
  validee: null,
  fin: null,
};

export const BANDEAU = {
  ...ETAPE,
  n: 3,
  type: 'etape',
  parcours: { titre: PARCOURS.titre, etape: 0 },
  titre: 'On branche Chrome',
  cartes: [],
  pourTaTache: null,
  bandeau: { id: 'chrome', texte: 'Va dans la fenêtre de Claude Code et tape cette commande, puis reviens ici.', aTaper: '/chrome' },
};

export const VALIDEE = {
  n: 9,
  type: 'validee',
  parcours: PARCOURS,
  titre: 'Étape 3 validée !',
  explication: 'Ta tâche vaut le coup : 22 heures par an, et un client mieux servi.',
  pourTaTache: null,
  cartes: [],
  travail: [],
  bandeau: null,
  validee: {
    concepts: [
      { nom: 'Valeur d\'une automatisation', definition: 'Elle vaut le coup quand la tâche revient souvent, prend du temps ou coûte cher en cas d\'erreur.', statut: 'premier-coup' },
      { nom: 'Quand ne pas automatiser', definition: 'Une tâche rare, rapide ou sans déclencheur ne le mérite pas.', statut: 'deuxieme-essai' },
      { nom: 'Découpage', definition: 'Une grosse tâche se fait en petites étapes vérifiables.', statut: 'a-revoir' },
    ],
    suivante: 'Découper',
  },
  fin: null,
};

export const FIN = {
  n: 30,
  type: 'fin',
  parcours: { titre: PARCOURS.titre, etape: 8 },
  titre: 'Ton rapport du lundi se fait tout seul.',
  explication: 'Tu viens de récupérer environ 22 heures par an. Et tu sais maintenant comment le refaire.',
  pourTaTache: null,
  cartes: [{
    id: 'resume',
    type: 'choix',
    question: 'Le résumé pour Mario',
    options: [
      { texte: 'Je le copie pour Mario maintenant', bonne: false },
      { texte: 'Plus tard', bonne: false },
    ],
    expliqueBonne: null,
    expliqueFausse: null,
    motCoach: null,
  }],
  travail: [],
  bandeau: null,
  validee: null,
  fin: {
    construit: [
      { label: 'Forme', valeur: 'Flux Zoho Flow' },
      { label: 'Déclencheur', valeur: 'Chaque lundi, 8 h' },
    ],
    concepts: [
      { nom: 'Valeur', statut: 'premier-coup' },
      { nom: 'Découpage', statut: 'deuxieme-essai' },
      { nom: 'Agent ou automatisation', statut: 'a-revoir' },
    ],
    resume: 'Parcours : Rapport hebdo des retards Zoho.\nLivré : flux Zoho Flow, désactivé.',
  },
};

export const ATTENTE = { n: 0, type: 'attente' };
