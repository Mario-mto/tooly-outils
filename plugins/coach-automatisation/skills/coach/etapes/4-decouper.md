# Étape 4 : découper

## But

Le plan de l'automatisation : son déclencheur, ses étapes dans l'ordre, et ce qui entre et sort
de chacune.

## Concepts du socle à vérifier

- `decoupage` : découpage en étapes.
- `entrees-sorties` : entrées et sorties.
- `declencheur` : déclencheur.

## Ce que tu fais

1. Propose le déclencheur : un événement (une fiche Zoho change, un courriel arrive, un fichier
   est déposé) ou une heure fixe (chaque lundi à 8 h). Fais-le choisir par une carte si plusieurs
   sont possibles. Pas de déclencheur, pas d'automatisation : si aucun ne tient, c'est une
   sortie sèche (voir plus bas).
2. Découpe en trois à sept étapes, chacune avec un verbe et un rôle clair (« lire les factures
   échues dans Zoho Books », « rédiger la relance », « envoyer le courriel »).
3. Pour chaque étape, note son entrée et sa sortie. Repère les étapes où ça peut casser (donnée
   absente, format qui change, accès refusé) et celles qui touchent des données réelles.
4. Montre le tout sous forme de liste ou de petit schéma texte, et fais-le confirmer par une
   carte.
5. Vérifie les trois concepts par des cartes, sur son découpage. Exemple pour le déclencheur :
   « Qu'est-ce qui lance ta relance ? » avec le vrai déclencheur et des distracteurs comme
   « l'envoi du courriel » (une action, pas un déclencheur).

## Ce que tu expliques

Un découpage net se construit, se teste et se répare étape par étape. Les entrées et sorties
montrent ce qui circule et où ça peut casser. Le déclencheur est ce qui fait passer une tâche du
niveau 2 (je la lance moi-même) au niveau 3 (elle part toute seule).

## Sortie sèche (aucun déclencheur ne tient)

1. Explique pourquoi : sans événement ni heure fixe pour la lancer, la tâche ne peut pas partir
   seule. C'est le quatrième critère de l'étape 3 qui tombe.
2. Si `declencheur` n'est pas encore réussi, vérifie-le par une carte (`cartes.md`).
3. Carte de confirmation (« On s'arrête là », « Je veux revoir le déclencheur »).
4. Arrête le parcours :
   `progression.mjs arreter --id <id> --raison "<raison en une phrase>"`
5. Ne propose aucun livrable de remplacement, puis remets le résumé pour Mario (« Fin de
   parcours » dans `SKILL.md`).

## Selon la porte

- `idee` : le découpage décrit le futur fonctionnement, pas une pratique existante ; vérifie avec
  lui que chaque entrée existe vraiment quelque part.
- `existante` : pars du découpage actuel, marque ce qui change (étape ajoutée, déclencheur
  remplacé, sortie enrichie) et garde ce qui marche.

## Valider

`progression.mjs valider-etape --id <id> --etape 4 --notes "<synthèse>"`
