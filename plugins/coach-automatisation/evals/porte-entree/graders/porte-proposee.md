---
type: llm
weight: 1
---

Dans cet environnement, l'outil de cartes (AskUserQuestion) peut être absent. PASS si Claude
demande avec quoi la personne arrive en proposant trois portes d'entrée : une tâche qui revient,
une idée d'outil, une automatisation existante à améliorer (par une carte, ou en texte si l'outil
de cartes manque), et ne commence encore rien à construire. FAIL si Claude part dans une autre
direction, pose une question ouverte sans proposer ces trois portes, ou construit déjà quelque
chose.
