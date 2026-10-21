# Les cartes de compréhension

Une carte vérifie qu'il a compris un concept du socle (`socle.json`). Ce n'est pas un examen :
c'est le moment où il prouve qu'il saurait refaire le choix seul.

## Écrire une carte

- **Un concept par carte**, pris dans le socle de l'étape en cours.
- **Sur sa tâche réelle**, jamais sur un exemple abstrait. Pas « Qu'est-ce qu'un déclencheur ? »
  mais « Pour tes relances de factures, qu'est-ce qui devrait lancer l'automatisation ? ».
- **Une seule bonne réponse**, sans ambiguïté pour quelqu'un qui a compris.
- **Des distracteurs plausibles** : les erreurs qu'un débutant ferait vraiment (confondre
  déclencheur et action, croire qu'il faut tout automatiser, tester directement sur le réel).
  Jamais de réponse absurde ou piège de vocabulaire.
- 3 ou 4 options, la bonne réponse à une position variable (pas toujours la première).
- Aucune option marquée recommandée, aucun indice dans les libellés ou les descriptions.
- `header` court, par exemple « Déclencheur », « Valeur », « Secrets ».
- Sur la page (`page.md`), la carte est un `quiz` : écris d'avance `expliqueBonne` (le pourquoi
  en une phrase) et `expliqueFausse` (la bonne réponse et pourquoi, sans jugement). La page
  corrige à l'instant ; tu n'interviens que pour le mot du coach d'un quiz raté.

## Après la réponse

- **Réussie** : confirme en une phrase et ajoute le pourquoi en une phrase. Puis
  `carte --resultat reussi`.
- **Ratée** : sans jugement, explique pourquoi l'autre réponse est la bonne, avec une autre image
  ou un autre angle que la première fois. Puis `carte --resultat rate`.
- **Deuxième essai** : une nouvelle carte sur le même concept, formulée autrement (autre
  situation de sa tâche, autres options). Jamais la même carte reposée.
- **Deuxième échec** : explique une dernière fois, note `rate`, dis-lui que ce concept est noté
  « à revoir » et qu'on y reviendra, puis avance. Le script calcule seul le statut.
- **Réponse en champ libre** : juge si elle montre la compréhension du concept. Si oui, note
  `reussi` ; si elle est partielle, complète et compte-la comme ratée.
