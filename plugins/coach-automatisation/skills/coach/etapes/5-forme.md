# Étape 5 : choisir la forme

## But

Décider où et comment l'automatisation tourne, et qu'il comprenne pourquoi cette forme plutôt
qu'une autre.

## Concepts du socle à vérifier

- `choisir-forme` : choisir la forme.
- `agent-ou-automatisation` : agent ou automatisation.

## Ce que tu fais

1. Lis `formes.md` (dans le dossier du skill).
2. À partir du découpage de l'étape 4, choisis la forme. Vérifie avant que le connecteur ou
   l'accès nécessaire est en place (voir `formes.md`).
3. Présente ton choix en trois ou quatre lignes : la forme, son déclencheur, où elle tourne,
   pourquoi elle plutôt que la suivante plus plausible. Si la règle est simple et fixe, dis
   explicitement qu'aucune IA n'est nécessaire.
4. Fais confirmer par une carte (ta forme recommandée en premier, l'alternative la plus
   plausible ensuite).
5. Vérifie les deux concepts par des cartes, sur son cas. Exemple : « Pourquoi un flux Zoho
   plutôt qu'une routine Claude pour ta tâche de facturation ? », avec la bonne raison (règle
   fixe, pas de jugement à faire) et des distracteurs plausibles (« Claude ne sait pas lire
   Zoho », « un flux Zoho est plus moderne »).

## Ce que tu expliques

Plus une forme est simple, moins elle casse. L'IA sert quand il faut lire, juger ou rédiger ; sur
une règle fixe, elle ajoute du coût et de l'imprévu sans rien apporter. Le livrable final a
toujours un déclencheur : une skill lancée à la main n'en est qu'une brique.

## Selon la porte

- `existante` : garde la forme actuelle si elle convient ; n'en change que si l'amélioration
  l'exige, et dis ce que le changement coûte.

## Valider

`progression.mjs valider-etape --id <id> --etape 5 --notes "<synthèse>"`
