# Étape 3 : est-ce que ça vaut le coup ?

## But

Décider, avec lui, si la tâche mérite une automatisation. C'est ici que le parcours peut
s'arrêter (l'étape 4 aussi, si aucun déclencheur ne tient), et s'arrêter est parfois la bonne
réponse.

## Concepts du socle à vérifier

- `valeur` : valeur d'une automatisation.
- `quand-ne-pas-automatiser` : quand ne pas automatiser.

## Ce que tu fais

1. Pèse quatre critères, à partir de la description de l'étape 2 :
   - **fréquence** : combien de fois par semaine, par mois, par an ;
   - **temps passé** : à chaque fois, et sur un an ;
   - **coût d'une erreur** : ce qui arrive si c'est oublié ou mal fait (client mécontent,
     facture en retard, rien de grave) ;
   - **déclencheur naturel** : existe-t-il un événement ou une heure fixe qui pourrait lancer la
     tâche sans lui.
   Les seuils restent à ton jugement : une tâche rare mais coûteuse en cas d'erreur peut valoir
   le coup ; une tâche fréquente mais de deux minutes, sans déclencheur, peut ne pas le valoir.
   Compare le gain au temps de construction et d'entretien (compte au moins une heure pour une
   automatisation simple).
2. Donne ton avis clairement, en un tableau ou trois lignes : chaque critère, ce que dit sa
   tâche, le verdict.
3. Vérifie les deux concepts par des cartes (`cartes.md`), sur sa tâche. Exemple pour une tâche
   qui ne vaut pas le coup : « Ta tâche revient une fois par an et prend 5 minutes. Qu'est-ce qui
   ferait changer l'avis ? » avec une bonne réponse (« une erreur qui coûterait cher ») et des
   distracteurs plausibles.

## Ce que tu expliques

Une automatisation coûte : la construire, la tester, l'entretenir quand un outil change. Elle ne
rapporte que si la tâche revient souvent, prend du temps ou coûte cher quand elle rate. Sans
déclencheur naturel, ce n'est de toute façon pas une automatisation.

## Sortie sèche

Si ça ne vaut pas le coup :

1. explique pourquoi, critère par critère, et présente le renoncement comme une bonne décision :
   savoir ne pas automatiser fait partie du niveau 3 ;
2. vérifie le concept `quand-ne-pas-automatiser` par une carte ;
3. carte de confirmation (« On s'arrête là », « Je veux revoir un critère ») ;
4. arrête le parcours :
   `progression.mjs arreter --id <id> --raison "<raison en une phrase>"`
5. ne propose aucun livrable de remplacement : pas de modèle, de rappel, de skill, de script ni
   d'automatisation réduite. S'il a une autre tâche en tête, il peut ouvrir un nouveau parcours ;
6. remets le résumé pour Mario (« Fin de parcours » dans `SKILL.md`).

## Selon la porte

- `idee` : estime la fréquence et le temps à partir du besoin décrit ; si personne ne sait dire
  combien de fois ça arriverait, dis-le et pèse prudemment.
- `existante` : la question devient « l'amélioration vaut-elle le coup ? » : ce qu'elle ferait
  gagner par rapport à l'automatisation actuelle, et le risque de casser ce qui marche.

## Valider (si ça vaut le coup)

`progression.mjs valider-etape --id <id> --etape 3 --notes "<synthèse>"`
