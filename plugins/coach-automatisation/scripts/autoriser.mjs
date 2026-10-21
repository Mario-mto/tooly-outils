#!/usr/bin/env node
// Hook PreToolUse du coach : approuve la commande de progression et la lecture des fichiers du plugin.
// Lit le JSON du hook sur stdin. N'écrit que la décision allow ; dans tous les autres cas, se tait
// et sort avec le code 0 : le circuit normal des permissions s'applique.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { decider } from './lib/autorisation.mjs';

const RACINE = fileURLToPath(new URL('..', import.meta.url));

function principal() {
  let entree;
  try {
    entree = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return;
  }
  const decision = decider(entree, RACINE);
  if (!decision) return;
  const sortie = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'allow',
      permissionDecisionReason: decision.raison,
    },
  };
  process.stdout.write(`${JSON.stringify(sortie)}\n`);
}

try {
  principal();
} catch {
  // Au moindre imprévu, aucune décision : le circuit normal s'applique.
}
process.exitCode = 0;
