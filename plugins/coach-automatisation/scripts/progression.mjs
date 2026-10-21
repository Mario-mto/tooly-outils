#!/usr/bin/env node
// Ligne de commande du coach : tient la progression des parcours.
// Sortie : JSON sur stdout (Markdown pour `resume`). Erreur : JSON sur stderr, code de sortie 1.

import { copyFileSync, existsSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import {
  ErreurParcours,
  creerParcours,
  validerEtape,
  noterCarte,
  arreter,
  enregistrerLivraison,
  enregistrerPage,
  confirmerFonctionnement,
  calculerCriteres,
  resumer,
} from './lib/parcours.mjs';
import { lireParcours, ecrireParcours, listerParcours, parcoursActif, existeParcours } from './lib/stockage.mjs';

const OPTIONS = {
  data: { type: 'string' },
  titre: { type: 'string' },
  porte: { type: 'string' },
  'installation-requise': { type: 'boolean' },
  id: { type: 'string' },
  etape: { type: 'string' },
  concept: { type: 'string' },
  resultat: { type: 'string' },
  raison: { type: 'string' },
  forme: { type: 'string' },
  declencheur: { type: 'string' },
  fiche: { type: 'string' },
  notes: { type: 'string' },
  vers: { type: 'string' },
  url: { type: 'string' },
};

function chargerSocle() {
  return JSON.parse(readFileSync(new URL('../socle.json', import.meta.url), 'utf8'));
}

// Page à copier : COACH_PAGE_SOURCE la remplace si elle est définie (réservé aux tests).
function sourcePage() {
  return process.env.COACH_PAGE_SOURCE || fileURLToPath(new URL('../page/page.html', import.meta.url));
}

// Les parcours d'avant le champ `page` n'en ont pas : on rend null.
function avecPage(p) {
  return p ? { ...p, page: p.page ?? null } : p;
}

function dossierDonnees(valeurs) {
  return valeurs.data || process.env.CLAUDE_PLUGIN_DATA || join(homedir(), '.coach-automatisation');
}

function exiger(valeurs, ...noms) {
  for (const nom of noms) {
    if (valeurs[nom] === undefined || valeurs[nom] === '') {
      throw new ErreurParcours('option-manquante', `Option manquante : --${nom}.`);
    }
  }
}

function lireEtape(texte) {
  const n = Number(texte);
  if (!Number.isInteger(n)) throw new ErreurParcours('option-invalide', `--etape doit être un nombre entier, reçu « ${texte} ».`);
  return n;
}

function modifier(dossier, id, changement) {
  const p = changement(lireParcours(dossier, id));
  ecrireParcours(dossier, p);
  return p;
}

const COMMANDES = {
  nouveau(v, dossier, maintenant) {
    exiger(v, 'titre', 'porte');
    const p = creerParcours({ titre: v.titre, porte: v.porte, installationRequise: Boolean(v['installation-requise']) }, maintenant);
    if (existeParcours(dossier, p.id)) {
      throw new ErreurParcours('parcours-existe', `Un parcours « ${p.id} » existe déjà. Reprends-le ou choisis un autre titre.`);
    }
    ecrireParcours(dossier, p);
    return p;
  },
  etat(v, dossier) {
    return avecPage(v.id ? lireParcours(dossier, v.id) : parcoursActif(dossier));
  },
  page(v, dossier) {
    // Sans --id : la page de l'accueil, publiée avant que le parcours existe.
    exiger(v, 'vers');
    if (v.id) lireParcours(dossier, v.id);
    const vers = resolve(v.vers);
    if (!existsSync(vers) || !statSync(vers).isDirectory()) {
      throw new ErreurParcours('dossier-absent', `Le dossier ${vers} n'existe pas.`);
    }
    const source = sourcePage();
    if (!existsSync(source)) throw new ErreurParcours('page-absente', `La page du coach est introuvable : ${source}.`);
    const fichier = join(vers, `coach-${v.id || 'nouveau'}.html`);
    copyFileSync(source, fichier);
    return { fichier };
  },
  adresse(v, dossier) {
    exiger(v, 'id', 'url');
    return avecPage(modifier(dossier, v.id, (p) => enregistrerPage(p, v.url)));
  },
  liste(v, dossier) {
    return listerParcours(dossier);
  },
  'valider-etape'(v, dossier, maintenant) {
    exiger(v, 'id', 'etape');
    return modifier(dossier, v.id, (p) => validerEtape(p, lireEtape(v.etape), maintenant, v.notes));
  },
  carte(v, dossier, maintenant) {
    exiger(v, 'id', 'concept', 'resultat');
    const socle = chargerSocle();
    return modifier(dossier, v.id, (p) => noterCarte(p, v.concept, v.resultat, socle, maintenant));
  },
  arreter(v, dossier, maintenant) {
    exiger(v, 'id', 'raison');
    return modifier(dossier, v.id, (p) => arreter(p, v.raison, maintenant));
  },
  livrer(v, dossier, maintenant) {
    exiger(v, 'id', 'forme', 'declencheur', 'fiche');
    const fiche = resolve(v.fiche);
    if (!existsSync(fiche)) throw new ErreurParcours('fiche-introuvable', `Fiche introuvable : ${fiche}.`);
    const ficheContenu = readFileSync(fiche, 'utf8');
    return modifier(dossier, v.id, (p) =>
      enregistrerLivraison(p, { forme: v.forme, declencheur: v.declencheur, fiche, ficheContenu }, maintenant),
    );
  },
  confirmer(v, dossier, maintenant) {
    exiger(v, 'id');
    return modifier(dossier, v.id, (p) => confirmerFonctionnement(p, maintenant));
  },
  criteres(v, dossier, maintenant) {
    return calculerCriteres(listerParcours(dossier), chargerSocle(), maintenant);
  },
  resume(v, dossier, maintenant) {
    return resumer(listerParcours(dossier), chargerSocle(), maintenant);
  },
};

function erreur(code, message) {
  process.stderr.write(`${JSON.stringify({ erreur: code, message })}\n`);
  process.exitCode = 1;
}

function principal(argv) {
  let analyse;
  try {
    analyse = parseArgs({ args: argv, options: OPTIONS, allowPositionals: true });
  } catch (e) {
    return erreur('option-invalide', e.message);
  }
  const [commande] = analyse.positionals;
  const action = COMMANDES[commande];
  if (!action) {
    return erreur('commande-inconnue', `Commande inconnue : « ${commande ?? ''} ». Commandes : ${Object.keys(COMMANDES).join(', ')}.`);
  }
  try {
    const resultat = action(analyse.values, dossierDonnees(analyse.values), new Date());
    process.stdout.write(typeof resultat === 'string' ? resultat : `${JSON.stringify(resultat, null, 2)}\n`);
  } catch (e) {
    if (e instanceof ErreurParcours) return erreur(e.code, e.message);
    return erreur('erreur-interne', e.message);
  }
}

principal(process.argv.slice(2));
