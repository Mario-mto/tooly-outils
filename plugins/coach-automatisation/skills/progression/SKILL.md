---
name: progression
description: "Montre la progression de l'employé dans le coach d'automatisation, sans rien modifier. À utiliser dès qu'on demande « où j'en suis », « ma progression », « mon parcours », « mes concepts à revoir », « mes critères vers le niveau 3 », ou le résumé pour Mario. Ne lance pas le parcours : pour avancer ou reprendre le travail, c'est le skill coach."
allowed-tools: Bash(node "${CLAUDE_PLUGIN_ROOT}/scripts/progression.mjs" *), PowerShell(node "${CLAUDE_PLUGIN_ROOT}/scripts/progression.mjs" *), Read(${CLAUDE_PLUGIN_ROOT}/**)
---

# Ma progression

Tu montres à l'employé où il en est. Lecture seule : tu ne valides rien, tu ne notes aucune carte.
Français, tutoiement, phrases courtes, jamais de tiret long.

## Récupérer les données

Lance `liste` puis `criteres` :

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/progression.mjs" liste
node "${CLAUDE_PLUGIN_ROOT}/scripts/progression.mjs" criteres
```

Lance chaque commande telle quelle, seule : pas de `cd`, pas de tube, pas de redirection.

Si le terminal ou Node est indisponible, dis-le en une ligne, puis utilise la sortie des scripts
si l'employé l'a collée dans son message. Sans données, dis que tu ne peux pas lire sa progression
pour l'instant et renvoie vers `docs/guide-installation.md` du dépôt du coach. N'invente rien.
Si le script répond une erreur (`{"erreur": ...}`), explique-la simplement.

Les noms lisibles des concepts sont dans `${CLAUDE_PLUGIN_ROOT}/socle.json` (champ `nom` selon
l'`id`). Écris toujours le nom, jamais l'id.

## Ce que tu affiches

Dans cet ordre :

1. **Parcours** : pour le parcours en cours le plus récent (`statut` `en-cours`), titre, et
   « étape N sur 8 en cours » (`etapeCourante`). Étapes 1 à 8 en trois groupes : faites
   (`validee`), en cours, à venir. Ne compte pas l'étape 0 si elle est `non-requise`.
2. **Concepts acquis**, tous parcours confondus : ceux au statut `acquis` dans au moins un
   parcours, par leur nom.
3. **Concepts à revoir**, tous parcours confondus : ceux au statut `a-revoir` dans un parcours
   et `acquis` dans aucun (même règle que `resume`), par leur nom, avec une phrase pour dire que
   ce n'est pas grave et qu'on les retravaille dans le coach.
4. **Livraison** : pour ce parcours, si `livraison` n'est pas `null`, forme et déclencheur, et
   si elle est confirmée.
5. **Les trois critères vers le niveau 3**, d'après `criteres` :
   - une automatisation qui tourne (`automatisationQuiTourne`),
   - le socle de concepts acquis (`socle.ok` ; liste des `manquants` par leur nom),
   - une fiche complète (`ficheComplete`).
   Pour chacun : rempli ou pas encore.

S'il y a d'autres parcours (livrés, arrêtés), une ligne chacun avec leur statut (pour un arrêt,
l'étape `arret.etape` et la raison). S'il n'y en a
aucun : dis qu'il n'a pas encore commencé et qu'il peut lancer le coach.

Termine par une seule suite possible : reprendre avec le skill coach.

## Résumé pour Mario

Si on te demande le résumé pour Mario (ou pour le manager), lance `resume` et rends son Markdown
tel quel, sans l'enjoliver, puis dis-lui de le copier dans un message Cliq à Mario :

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/progression.mjs" resume
```

Terminal indisponible : dis-le, et construis un court résumé depuis les données collées, en
précisant que c'est une version reconstituée.
