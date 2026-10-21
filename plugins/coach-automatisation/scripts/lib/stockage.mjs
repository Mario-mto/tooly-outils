// Lecture et écriture des parcours : un fichier JSON par parcours dans <dossier>/parcours/.
// Un fichier abîmé n'est jamais écrasé : on s'arrête avec une erreur qui donne son chemin.

import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ErreurParcours } from './parcours.mjs';

const ID_VALIDE = /^[a-z0-9][a-z0-9-]*$/;

function dossierParcours(dossier) {
  return join(dossier, 'parcours');
}

function cheminParcours(dossier, id) {
  if (typeof id !== 'string' || !ID_VALIDE.test(id)) {
    throw new ErreurParcours('id-invalide', `Identifiant de parcours invalide : « ${id} ».`);
  }
  return join(dossierParcours(dossier), `${id}.json`);
}

function ressembleAUnParcours(p) {
  return (
    p !== null &&
    typeof p === 'object' &&
    p.version === 1 &&
    typeof p.id === 'string' &&
    typeof p.statut === 'string' &&
    Number.isInteger(p.etapeCourante) &&
    typeof p.etapes === 'object' &&
    typeof p.concepts === 'object'
  );
}

export function lireParcours(dossier, id) {
  const chemin = cheminParcours(dossier, id);
  if (!existsSync(chemin)) {
    throw new ErreurParcours('parcours-introuvable', `Aucun parcours « ${id} » dans ${dossierParcours(dossier)}.`);
  }
  let p;
  try {
    p = JSON.parse(readFileSync(chemin, 'utf8'));
  } catch {
    p = null;
  }
  if (!ressembleAUnParcours(p)) {
    throw new ErreurParcours(
      'fichier-illisible',
      `Le fichier ${chemin} est illisible ou a été modifié à la main. Il n'a pas été touché : corrige-le ou mets-le de côté.`,
    );
  }
  return p;
}

function attendre(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// OneDrive ou un antivirus peuvent bloquer un renommage un court instant : on réessaie.
function renommer(source, cible) {
  for (let essai = 1; ; essai++) {
    try {
      renameSync(source, cible);
      return;
    } catch (e) {
      if (essai >= 5 || !['EPERM', 'EBUSY', 'EACCES'].includes(e.code)) throw e;
      attendre(100 * essai);
    }
  }
}

export function ecrireParcours(dossier, p) {
  const chemin = cheminParcours(dossier, p.id);
  mkdirSync(dossierParcours(dossier), { recursive: true });
  const temporaire = `${chemin}.${process.pid}.tmp`;
  writeFileSync(temporaire, `${JSON.stringify(p, null, 2)}\n`, 'utf8');
  renommer(temporaire, chemin);
}

export function existeParcours(dossier, id) {
  return existsSync(cheminParcours(dossier, id));
}

export function listerParcours(dossier) {
  const d = dossierParcours(dossier);
  if (!existsSync(d)) return [];
  return readdirSync(d)
    .filter((nom) => nom.endsWith('.json'))
    .sort()
    .map((nom) => lireParcours(dossier, nom.slice(0, -'.json'.length)));
}

export function parcoursActif(dossier) {
  const enCours = listerParcours(dossier).filter((p) => p.statut === 'en-cours');
  if (enCours.length === 0) return null;
  return enCours.reduce((a, b) => (b.majLe > a.majLe ? b : a));
}
