# La page du coach

Le parcours se vit sur une page claude.ai aux couleurs de Tooly, ouverte dans son Chrome : tes
explications, les cartes, sa progression. La fenêtre de Claude Code reste en arrière-plan. Tu
écris l'écran dans la base de la page ; la page se redessine seule ; ses réponses reviennent
dans la base et la page te prévient par un commentaire.

## Publier la page (nouveau parcours, avant l'accroche)

1. `progression.mjs page --vers <dossier de travail de la session>` (sans `--id` : le parcours
   n'existe pas encore) : copie la page et rend `{ "fichier": ... }`.
2. Dis-lui en une phrase que tu crées sa page (`permissions.md`), puis outil `Artifact` : `file_path` =
   ce fichier, `capabilities` = `{"db": {}, "comments": {}}`, `icon` = `coach`, `description` =
   « Ton parcours avec le coach d'automatisation ». Note l'URL rendue.
3. Dès que `nouveau` a créé le parcours : `progression.mjs adresse --id <id> --url <URL>`.
4. Écris l'écran d'attente : `ArtifactData` `set`, `collection` `coach`, `doc_id` `ecran`,
   `data` `{"n": 1, "type": "attente"}`.
5. Dans la fenêtre de Claude Code, une ligne : « Ouvre ta page dans Chrome : <URL>. Garde-la
   ouverte, tout se passe là. » Puis une carte « Ta page est ouverte ? » (« Oui, je la vois »,
   « Je préfère rester ici »). Préviens-le : au premier clic dans la page, claude.ai lui demande
   son accord pour qu'elle t'écrive ; il accepte.
6. `ArtifactData` `get` `page`/`presence`. Présent : la page est vivante, passe par elle. Absent
   ou « Je préfère rester ici » : plan B.
7. Page vivante : un écran `etape` (étape 0, titre « Mario suit ton parcours », sans cartes)
   avec le `bandeau` `partage`, `aTaper` `null`, texte : « Partage ta page avec Mario : bouton
   Partager en haut à droite, écris Mario dans « Ajouter des personnes », choisis-le et laisse-lui
   seulement la lecture. Il verra où tu en es, sans rien pouvoir changer. » Son « C'est fait »
   te réveille : passe à l'accroche. Ne le redemande pas à la reprise, le partage reste.

## Reprendre (nouvelle session, relance, `/clear`)

La surveillance de la page ne survit pas à la session. À chaque démarrage sur un parcours qui a
une `page` (champ de `etat`) : `progression.mjs page --id <id> --vers <dossier de travail>`,
`Artifact` `read` de l'URL, puis `Artifact` publish du fichier avec `url` = l'URL (sans
`capabilities` ni `icon` : ils sont gardés). Cette republication demande la permission :
annonce-la (« réponds Yes »). Puis `ArtifactData` `get` `coach`/`ecran` pour
connaître `n` et la version, et écris l'écran suivant. Rappelle-lui de recharger la page.

## Afficher un écran

Un écran = un document `coach/ecran` écrit en entier (`set`), avec `n` augmenté de 1 et
`if_version` = la dernière version vue (chaque écriture rend la nouvelle). Puis termine ton tour
avec une ligne dans la fenêtre (« C'est sur ta page. ») : sa réponse te réveillera.

```
{ n, type: "accueil" | "etape" | "travail" | "validee" | "fin" | "relance",
  parcours: { titre, etape: 0 à 8 },
  titre, explication,
  pourTaTache: { lignes: [{ label, valeur }], verdict } | null,
  cartes: [{ id, type: "quiz" | "choix" | "texte", question,
             options: [{ texte, bonne }], expliqueBonne, expliqueFausse, motCoach: null }],
  travail: [{ texte, etat: "fait" | "en-cours" | "a-faire" }],
  bandeau: { id, texte, aTaper } | null,
  validee: { concepts: [{ nom, definition, statut }], suivante } | null,
  fin: { construit: [{ label, valeur }] | null, concepts: [{ nom, statut }], resume } | null,
  commandes: [{ aTaper, texte }], resume: "<Markdown>" | null }
```

- Ids des cartes et des bandeaux : minuscules, chiffres et `-` seulement (`temps`, `quiz-valeur`).
- `explication` : ce que tu aurais écrit dans la fenêtre, en un paragraphe court. Quand elle
  explique un concept, elle commence par l'image du quotidien (SKILL, motif, point 2), puis sa
  tâche.
- Quiz (`cartes.md`) : `bonne: true` sur une seule option, `expliqueBonne` et `expliqueFausse`
  écrites d'avance. La page corrige seule, sans t'attendre.
- Choix : la recommandée en premier (`bonne` à `false` partout). Texte : `options` vide.
- `bandeau` : ce qu'il doit faire dans la fenêtre de Claude Code (`aTaper` : la commande exacte,
  ou `null`). Il clique « C'est fait » quand c'est fait. Un écran à bandeau n'a pas de cartes :
  une seule raison de te réveiller.
- `relance` : l'écran à écrire juste avant qu'il te coupe (`/clear`, relance du coach, arrêt
  pour reprendre plus tard). `commandes` dans l'ordre : la commande exacte et une ligne qui dit
  ce qu'elle fait. La page ajoute seule la commande de progression et dit que tout est
  sauvegardé. Ni cartes ni bandeau : personne ne t'écoute avant la reprise. Écris-le, redis les
  commandes en une ligne dans la fenêtre, puis termine ton tour. `resume` : pour une pause ou
  un arrêt, le Markdown de `progression.mjs resume`, que la page fait copier pour Mario ; `null`
  pour la relance de l'étape 0.
- `travail` (écran `travail`) : la liste de ce que tu fais ; à chaque action finie, `update` de
  `travail` avec la ligne passée à `fait` et la suivante à `en-cours`. Dans `pourTaTache.lignes`,
  le pourquoi de ce que tu fais et un rappel de concept (affichés à côté).
- `validee.concepts[].statut` et `fin.concepts[].statut` : `premier-coup`, `deuxieme-essai` ou
  `a-revoir`, d'après `etat`.

## Quand la page te réveille

Une notification de commentaire « Réponse de l'écran n » arrive : ne réponds pas dans le fil.
D'abord `ArtifactData` `get` `coach`/`ecran` : si son `n` dépasse celui de la notification, elle
est déjà traitée (double clic, renvoi) ; termine ton tour sans rien écrire. Sinon, `update` du
même `n` avec `vu` = l'heure : la page sait que tu as reçu et ne parle pas de silence pendant
que tu travailles. Puis lis `ArtifactData` `query` sur `reponses` avec `where` `[["ecran", "==", n]]`. Documents :
`<n>-<carte>` (`choix` = index de l'option, `texte`, `juste` pour un quiz), `<n>-continuer`,
`<n>-bandeau-<id>`. La page te sonne dans ces cas :

- **Quiz raté** (sans `continuer`) : écris le mot du coach. `update` de `cartes` (le tableau
  entier) avec `motCoach` rempli sur cette carte, même `n` : deux ou trois phrases, un autre
  angle que `expliqueFausse`. Puis termine ton tour.
- **Continuer** : note chaque quiz de l'écran avec `carte` (`juste` donne `reussi` ou `rate`),
  une seule fois par quiz ; lis aussi ses choix et textes (« On valide » ou « Je veux revoir un
  point ») et suis-les ; puis l'écran suivant (deuxième essai sur un concept raté, selon
  `cartes.md`).
- **Choix ou texte** qui complète un écran sans quiz : traite la réponse comme celle d'une carte
  du terminal, puis l'écran suivant.
- **Bandeau fait** : vérifie ce qui devait être fait, puis l'écran suivant.

Un message qu'il tape dans la fenêtre de Claude Code passe toujours avant la page.

## Plan B : retour aux cartes

Passe aux cartes `AskUserQuestion`, comme avant la page, si : il écrit « terminal » ; la
présence de la page manque ; un outil d'artefact échoue ou est refusé. Dis-le en une ligne, sans
dramatiser. Sa progression ne change pas. Retour à la page quand il le demande, ou au prochain
démarrage.
