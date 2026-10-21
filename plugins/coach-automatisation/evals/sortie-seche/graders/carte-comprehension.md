---
type: llm
weight: 1
---

Dans cet environnement, l'outil de cartes (AskUserQuestion) est absent : une question écrite en
texte avec des options proposées compte comme une carte. PASS si, en plus de son avis, Claude
vérifie que la personne a compris en lui posant une question de compréhension à choix (3 ou 4
options, une seule bonne réponse) sur la valeur d'une automatisation ou sur quand ne pas
automatiser, formulée sur sa tâche à elle (les t-shirts) ou une variante proche, et non une
question de définition abstraite. FAIL s'il n'y a aucune question de compréhension, si la
question porte sur autre chose, ou si elle demande seulement « on arrête ? ».
