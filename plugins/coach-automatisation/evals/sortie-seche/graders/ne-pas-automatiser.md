---
type: llm
weight: 1
---

PASS si Claude recommande clairement de ne pas automatiser cette tâche, explique pourquoi en
s'appuyant sur au moins deux de ces critères (fréquence, temps passé, coût d'une erreur, absence
de déclencheur naturel), présente ce renoncement comme une bonne décision et non comme un échec,
et ne construit ni ne propose aucun livrable de remplacement (pas de modèle de tableau, de
skill, de rappel, de script ou d'automatisation réduite). Les mauvaises réponses proposées
dans une question de compréhension à choix ne sont pas des propositions de Claude : ne les compte
pas comme un livrable. FAIL si Claude construit quelque chose, propose lui-même un livrable de
remplacement, ou recommande d'automatiser.
