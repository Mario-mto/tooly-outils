# Outils Tooly pour Claude Code

Marketplace interne de Tooly. Il contient un plugin :

- **coach-automatisation** : un coach qui t'accompagne étape par étape pour transformer une
  tâche répétitive en automatisation, et t'apprend ce que tu fais en chemin.

## Installer

Ouvre l'application Claude, onglet **Code**, et colle cette phrase :

```
Prépare mon poste pour le coach d'automatisation de Tooly : lis mot pour mot la procédure https://raw.githubusercontent.com/Mario-mto/tooly-outils/main/PREPARER.md (avec curl) et suis-la. Réponds en français et tutoie-moi.
```

Claude vérifie ton poste (Windows ou Mac), installe ce qui manque (git, Node, le coach), te guide
pour l'extension Claude de Chrome, puis te demande un seul redémarrage de Chrome et de Claude.
Accepte ses demandes de permission. Ensuite, tape `/coach-automatisation:coach`.

La procédure qu'il suit est dans [`PREPARER.md`](PREPARER.md).

## Mettre à jour

Dans l'onglet Code de l'application Claude, colle cette phrase :

```
Mets à jour le plugin coach-automatisation du catalogue tooly-outils, avec les commandes plugin de Claude Code (son programme est indiqué par la variable CLAUDE_CODE_EXECPATH). Dis-moi ensuite s'il faut redémarrer l'application.
```
