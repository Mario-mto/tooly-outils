# Étape 2 : décrire l'existant

## But

Une image fidèle de la façon dont ça se passe aujourd'hui : quoi, qui, quand, avec quels outils,
d'où viennent les informations et où elles vont. Pas de concept du socle à vérifier ici : cette
description nourrit les étapes 3 et 4.

## Ce que tu fais

1. Pose tes questions par cartes, une ou deux à la fois, avec des réponses plausibles tirées de
   ce qu'il a déjà dit (champ libre pour le reste) :
   - qu'est-ce qui lance la tâche aujourd'hui (une demande, un courriel, une date, « quand j'y
     pense ») ;
   - à quelle fréquence, et combien de temps ça prend ;
   - quels outils sont touchés (Zoho, Google Workspace, fichiers Excel, PDF ou Word, autre) ;
   - ce qui sort à la fin, et pour qui ;
   - ce qui se passe quand c'est mal fait ou oublié.
2. Si un exemple réel existe (un fichier, un courriel type), demande-lui de te le montrer : lis-le
   plutôt que de deviner. Ne garde aucune donnée personnelle dans tes notes.
3. Écris la description en cinq à dix lignes et fais-la confirmer par une carte.

## Ce que tu expliques

Pourquoi on décrit avant de juger : la fréquence, le temps et le coût d'erreur qu'on note ici
décident à l'étape 3 si ça vaut le coup. Une description floue mène à une automatisation fragile.

## Selon la porte

- `idee` : décris le besoin plutôt qu'une pratique : qui a le problème, à quelle fréquence, ce
  qu'il fait à la place aujourd'hui (souvent rien, ou un bricolage).
- `existante` : décris ce que l'automatisation fait déjà (déclencheur, étapes, forme, où elle
  tourne), ce qui manque ou casse, et qui s'en sert. Lis-la si tu y as accès.

## Valider

`progression.mjs valider-etape --id <id> --etape 2 --notes "<synthèse>"`
