# Les formes possibles

La forme dit où et comment l'automatisation tourne. Choisis la plus simple qui fait le travail de
façon fiable, et explique ton choix sur son cas.

Avant de proposer une forme, vérifie que ce dont elle a besoin est en place : le connecteur utile
est branché (cherche ses outils dans ta session : Zoho, Google), ou l'employé confirme par une
carte qu'il a accès à l'outil. Si ce n'est pas le cas, dis-le et choisis une autre forme, ou
aide-le d'abord à brancher le connecteur.

## Formes finales (avec déclencheur)

La valeur entre parenthèses est celle à passer à `livrer --forme`.

| Forme | Valeur | Quand la choisir | Déclencheur |
|---|---|---|---|
| Flux natif Zoho : Zoho Flow, ou workflow Zoho avec fonction Deluge | `flux-zoho` ou `deluge` | La règle est simple et fixe, les données vivent dans Zoho, aucun jugement n'est nécessaire. Souvent la plus robuste : ça tourne dans Zoho, sans IA, sans dépendre du poste. | Événement Zoho (fiche créée ou modifiée, étape changée) ou planification Zoho. |
| Routine Claude planifiée | `routine-claude` | Il faut lire, résumer, rédiger ou juger des cas variés (courriels, documents, comptes rendus), avec ses connecteurs Zoho et Google. | Heure fixe. |
| Tâche planifiée sur le poste (Planificateur de tâches Windows) | `tache-poste` | Le travail porte sur des fichiers locaux (Excel, PDF, Word) ou un script, et le poste est allumé au bon moment. | Heure fixe, ou ouverture de session. |
| Mini-appli partagée (page artefact avec données) | `mini-appli` | Plusieurs personnes doivent saisir ou consulter les mêmes informations (suivi, inscriptions, tableau de bord). | Événement : une saisie dans la page. |

Choisis `flux-zoho` pour un flux Zoho Flow, `deluge` pour une fonction Deluge déclenchée par un
workflow Zoho.

## Briques, jamais livrables finaux

- **Skill** : des instructions que Claude suit quand on la lance. Utile comme brique d'une
  routine Claude, mais une skill lancée à la main reste du niveau 2 : il faut encore y penser.
- **Connecteur MCP** : il donne à Claude l'accès à un outil. Montre-le s'il sert, sans en faire
  le livrable ; construire un connecteur, c'est plutôt le niveau 4.

Si l'employé veut s'arrêter à une skill lancée à la main, refuse-le comme livrable final,
explique pourquoi, et propose la forme qui ajoute le déclencheur (souvent une routine Claude
planifiée qui appelle la skill).

## Agent ou automatisation

Une règle fixe (« si ceci, alors cela ») n'a pas besoin d'IA : une automatisation classique est
plus fiable, plus rapide et ne coûte rien à chaque passage. Un agent (une routine Claude) n'est
utile que quand il faut juger, rédiger ou s'adapter à des cas que la règle ne prévoit pas. Dis-le
explicitement quand tu choisis une forme sans IA.
