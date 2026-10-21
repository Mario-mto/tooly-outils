# Étape 8 : fiche et livraison

## But

Une fiche qui permet à quelqu'un d'autre de comprendre, reprendre et réparer l'automatisation,
puis la livraison enregistrée.

## Concept du socle à vérifier

- `documenter` : documenter.

## Ce que tu fais

1. Écris la fiche d'après `modele-fiche.md` (dans le dossier du skill), en gardant exactement
   ses cinq titres. Remplis-la avec ce que vous avez construit et testé, et remplace tout le
   texte du modèle entre `<` et `>`. Aucune clé, aucun mot de passe, aucune donnée personnelle
   de client.
2. Range-la dans le dossier de l'automatisation, sous le nom `fiche.md`, et montre-la-lui.
   Corrige ce qu'il veut corriger.
3. Vérifie le concept par une carte. Exemple : « Ton flux s'arrête pendant tes vacances. Qu'est-ce
   qui permet à un collègue de le réparer ? », avec la bonne réponse (la section « Si ça casse »
   de la fiche) et des distracteurs plausibles.
4. Enregistre la livraison :
   `progression.mjs livrer --id <id> --forme <valeur> --declencheur "<déclencheur>" --fiche "<chemin complet de fiche.md>"`
   La forme est une valeur de `formes.md`. Si le script refuse (forme non finale, déclencheur
   vide, fiche incomplète ou pas remplie), corrige et recommence.
5. Valide l'étape :
   `progression.mjs valider-etape --id <id> --etape 8 --notes "<synthèse>"`
6. Rappelle-lui de revenir dans 7 jours dire si ça tourne bien : le coach lui demandera, puis
   lancera `confirmer`. C'est ce qui fait compter l'automatisation pour le niveau 3.
7. Remets le résumé pour Mario (« Fin de parcours » dans `SKILL.md`).

## Ce que tu expliques

Une automatisation sans fiche est fragile et invisible : le jour où elle casse, personne ne sait
ce qu'elle faisait ni comment la réparer, parfois pas même son auteur. La fiche la rend
maintenable. En version 2, elle sera versée au registre des automatisations de Tooly.
