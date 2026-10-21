// Décision du hook PreToolUse : autorise trois choses et rien d'autre.
// 1. Bash ou PowerShell : node "<racine>/scripts/progression.mjs" suivi d'arguments sûrs.
// 2. Read : un fichier situé dans la racine du plugin.
// 3. La page de l'atelier d'un parcours : sa publication (copie exacte de page/page.html), sa base
//    et la surveillance de ses commentaires. Jamais sa suppression, ni une autre page.
// Tout le reste rend null : le circuit normal des permissions s'applique.

import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';
import { listerParcours } from './stockage.mjs';

const WINDOWS = process.platform === 'win32';

// Jeton nu : lettres (accents compris), chiffres et quelques signes sans effet dans Bash ni PowerShell.
// Il ne commence pas par @ (éclatement de variable dans PowerShell). Pas de % : le symbole --% de
// PowerShell soumettrait la suite de la ligne à l'expansion %VAR%.
const JETON_NU = /^(?![@])[\p{L}\p{M}0-9\-_.,:/\\=+@]+/u;
// Entre guillemets droits : ni guillemet, ni $, ni accent grave, ni saut de ligne, ni NUL,
// ni guillemet typographique double (PowerShell le lit comme un guillemet droit).
const ENTRE_GUILLEMETS = /^"([^"$`\r\n\u0000\u201c-\u201f]*)"/u;
// Entre apostrophes droites : ni apostrophe, ni saut de ligne, ni NUL, ni apostrophe typographique.
const ENTRE_APOSTROPHES = /^'([^'\r\n\u0000\u2018-\u201b]*)'/u;

function normaliser(chemin) {
  const n = chemin.replaceAll('\\', '/');
  return WINDOWS ? n.toLowerCase() : n;
}

// Découpe la commande en jetons. Rend null au moindre doute.
function decouper(commande) {
  if (/[\r\n]/.test(commande)) return null;
  const jetons = [];
  let reste = commande.replace(/^[ \t]+|[ \t]+$/g, '');
  while (reste.length > 0) {
    let m;
    let jeton;
    if ((m = ENTRE_GUILLEMETS.exec(reste))) {
      if (m[1].endsWith('\\')) return null;
      jeton = { valeur: m[1], guillemets: true };
    } else if ((m = ENTRE_APOSTROPHES.exec(reste))) {
      jeton = { valeur: m[1], guillemets: true };
    } else if ((m = JETON_NU.exec(reste))) {
      jeton = { valeur: m[0], guillemets: false };
    } else {
      return null;
    }
    reste = reste.slice(m[0].length);
    if (reste.length > 0 && !/^[ \t]/.test(reste)) return null;
    reste = reste.replace(/^[ \t]+/, '');
    jetons.push(jeton);
  }
  return jetons;
}

function commandeAutorisee(commande, racine) {
  const jetons = decouper(commande);
  if (!jetons || jetons.length < 2) return false;
  const [executable, script] = jetons;
  if (executable.guillemets || executable.valeur !== 'node') return false;
  if (!script.guillemets) return false;
  return normaliser(script.valeur) === normaliser(`${racine.replace(/[\\/]+$/, '')}/scripts/progression.mjs`);
}

// Chemin réel : liens et jonctions résolus sur la plus longue partie qui existe.
function reel(chemin) {
  let tete = chemin;
  const suite = [];
  while (!existsSync(tete)) {
    const parent = dirname(tete);
    if (parent === tete) return chemin;
    suite.unshift(basename(tete));
    tete = parent;
  }
  return join(realpathSync.native(tete), ...suite);
}

function lectureAutorisee(chemin, racine) {
  if (!isAbsolute(chemin)) return false;
  const fichier = normaliser(reel(resolve(chemin)));
  const base = normaliser(reel(resolve(racine))).replace(/\/+$/, '');
  return fichier.startsWith(`${base}/`);
}

// Parcours rangés par le script de progression. Lancé en Bash, il n'a pas CLAUDE_PLUGIN_DATA
// (exportée aux seuls hooks) et range dans ~/.coach-automatisation : le hook lit les deux.
export function parcoursConnus() {
  const dossiers = [...new Set([process.env.CLAUDE_PLUGIN_DATA, join(homedir(), '.coach-automatisation')])];
  return dossiers.filter(Boolean).flatMap((d) => listerParcours(d)).map((p) => ({ id: p.id, page: p.page ?? null }));
}

// Adresse comparable : https://claude.ai/ exigé avec sa barre oblique, sans paramètres ni ancre.
function adresse(url) {
  if (typeof url !== 'string' || !url.startsWith('https://claude.ai/')) return null;
  return url.split(/[?#]/)[0].replace(/\/+$/, '');
}

function pageConnue(url, connus) {
  const a = adresse(url);
  return a !== null && connus.some((p) => adresse(p.page) === a);
}

const CAPACITES_PAGE = ['db', 'comments'];
const CLES_INTERDITES = ['asset', 'file_paths', 'files', 'root', 'force', 'overwrite_unread', 'contract'];

function artifactAutorise(params, racine, connus) {
  const action = params.action ?? 'publish';
  if (action === 'read') return pageConnue(params.url, connus);
  if (action !== 'publish') return false;
  if (CLES_INTERDITES.some((cle) => params[cle] !== undefined)) return false;
  if (typeof params.file_path !== 'string' || !isAbsolute(params.file_path)) return false;
  // Une republication écrase la page visée : l'adresse rangée par `adresse` peut venir d'une
  // injection, donc seule une nouvelle page passe sans question.
  if (params.url !== undefined) return false;
  const m = /^coach-([a-z0-9][a-z0-9-]*)\.html$/.exec(basename(params.file_path));
  if (!m) return false;
  if (m[1] !== 'nouveau' && !connus.some((c) => c.id === m[1])) return false;
  const capacites = params.capabilities;
  if (capacites !== undefined) {
    if (!capacites || typeof capacites !== 'object') return false;
    if (Object.keys(capacites).some((c) => !CAPACITES_PAGE.includes(c))) return false;
  }
  return readFileSync(params.file_path, 'utf8') === readFileSync(join(racine, 'page', 'page.html'), 'utf8');
}

// Base : seulement les collections de la page du coach, sans fichier local ni lot (un fichier
// local partirait dans une base que d'autres peuvent lire).
const COLLECTIONS_PAGE = ['coach', 'reponses', 'page'];

function donneesAutorisees(params, connus) {
  if (['file_path', 'as_level', 'writes'].some((cle) => params[cle] !== undefined)) return false;
  if (params.action === 'batch' || !COLLECTIONS_PAGE.includes(params.collection)) return false;
  return pageConnue(params.url, connus);
}

function commentairesAutorises(params, connus) {
  if (params.replies !== undefined || params.on !== undefined) return false;
  if (params.action === 'watch' && params.url === undefined) return true;
  return ['watch', 'read'].includes(params.action) && pageConnue(params.url, connus);
}

export function decider(entree, racine, connus = parcoursConnus) {
  try {
    if (!entree || typeof entree !== 'object' || entree.hook_event_name !== 'PreToolUse') return null;
    const { tool_name: outil, tool_input: params } = entree;
    if (!params || typeof params !== 'object') return null;
    if (outil === 'Artifact') {
      if (artifactAutorise(params, racine, connus())) return { raison: 'Page du parcours du coach, approuvée par le plugin.' };
    } else if (outil === 'ArtifactData') {
      if (donneesAutorisees(params, connus())) return { raison: 'Base de la page du coach, approuvée par le plugin.' };
    } else if (outil === 'ArtifactComments') {
      if (commentairesAutorises(params, connus())) return { raison: 'Commentaires de la page du coach, approuvés par le plugin.' };
    } else if ((outil === 'Bash' || outil === 'PowerShell') && typeof params.command === 'string') {
      if (commandeAutorisee(params.command, racine)) {
        return { raison: 'Commande de progression du coach, approuvée par le plugin.' };
      }
    } else if (outil === 'Read' && typeof params.file_path === 'string') {
      if (lectureAutorisee(params.file_path, racine)) {
        return { raison: "Lecture d'un fichier du coach, approuvée par le plugin." };
      }
    }
  } catch {
    return null;
  }
  return null;
}
