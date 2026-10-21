# Étape 7 : tester sur un vrai cas

## But

Prouver que l'automatisation marche, d'abord sans risque sur des données de test, puis sur un
vrai cas avec son accord.

## Concepts du socle à vérifier

- `demo-avant-reel` : données de démo avant données réelles.
- `tester-cas-reel` : tester sur un cas réel.

## Ce que tu fais

1. **Fabrique des données de test** bien repérées : fichiers dont le nom commence par « TEST »,
   fiches Zoho ou Google dont le nom commence par « TEST », destinataire de courriel = lui-même.
   Note la liste de tout ce que tu crées. Il n'existe pas d'environnement de démo commun : ces
   données vivent à côté des vraies, d'où l'importance du repérage.
2. **Teste** : déclenche l'automatisation sur ces données (fais passer la fiche TEST à l'étape
   voulue, lance la routine une fois, attends l'heure planifiée si besoin). Vérifie chaque sortie
   du découpage de l'étape 4. Corrige et reteste jusqu'à ce que tout passe.
3. **Supprime** les données de test, à partir de ta liste, et vérifie qu'il n'en reste aucune.
   Avant de supprimer, une carte qui liste exactement ce qui va disparaître.
4. **Cas réel** : une carte d'accord explicite qui dit ce qui va se passer et sur quoi (« Je vais
   laisser le flux tourner sur la prochaine vraie affaire gagnée : il créera une tâche pour son
   responsable »), avec l'option de refuser. Pas d'accord, pas de test réel.
5. Après le cas réel, vérifiez ensemble le résultat.
6. Vérifie les deux concepts par des cartes, sur ses tests. Exemple : « Pourquoi as-tu testé
   sur la fiche TEST avant la vraie ? », avec la bonne réponse (une erreur ne touche aucune vraie
   donnée) et des distracteurs plausibles.

## Ce que tu expliques

Le test sur données de démo attrape les erreurs sans dégâts. Le cas réel prouve que
l'automatisation sert vraiment, dans les conditions vraies (vraies données, vrais accès, vrai
déclencheur). Les deux sont nécessaires.

## Valider

`progression.mjs valider-etape --id <id> --etape 7 --notes "<synthèse>"`
