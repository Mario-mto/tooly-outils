#!/usr/bin/env node
// Construit page/page.html, la page autonome que le coach publie : le gabarit, le code de
// rendu.mjs inséré à la place de /*RENDU*/, et chaque ACTIF:<fichier> remplacé par une data URI.
// Usage : node plugins/coach-automatisation/scripts/construire-page.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, extname } from 'node:path';

const DOSSIER_PAGE = fileURLToPath(new URL('../page/', import.meta.url));

const TYPES = { '.ttf': 'font/ttf', '.png': 'image/png' };

export function construirePage(dossier = DOSSIER_PAGE) {
  const gabarit = readFileSync(join(dossier, 'gabarit.html'), 'utf8');
  const rendu = readFileSync(join(dossier, 'rendu.mjs'), 'utf8').replace(/^export\s+/gm, '');
  if (!gabarit.includes('/*RENDU*/')) throw new Error('marqueur /*RENDU*/ absent du gabarit');
  // Remplacements par fonction : le code inséré contient des « $ » qu'une chaîne interpréterait.
  return gabarit
    .replace('/*RENDU*/', () => rendu)
    .replace(/ACTIF:([\w.-]+)/g, (_, nom) => {
      const chemin = join(dossier, 'actifs', nom);
      const type = TYPES[extname(nom).toLowerCase()];
      if (!type || !existsSync(chemin)) throw new Error(`actif introuvable ou de type inconnu : ${nom}`);
      return `data:${type};base64,${readFileSync(chemin).toString('base64')}`;
    });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const sortie = join(DOSSIER_PAGE, 'page.html');
  writeFileSync(sortie, construirePage());
  process.stdout.write(`${JSON.stringify({ fichier: sortie })}\n`);
}
