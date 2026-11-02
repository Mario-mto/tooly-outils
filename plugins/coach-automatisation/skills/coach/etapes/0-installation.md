# Étape 0 : préparer son poste

## But

Au premier parcours, mettre en place ce qui rendra la suite fluide : la sauvegarde de sa
progression et la connexion à ses outils dans Chrome. git, Node, le plugin, l'extension Chrome
et l'autocompaction s'installent avec la phrase de préparation (procédure `PREPARER.md` du dépôt
`tooly-outils`), et Node et l'extension ont été vérifiés au démarrage, avant la page (SKILL,
« Vérifier le poste ») : ne les refais pas ici. Pas de concept du socle à vérifier ici.

## Ce que tu fais

1. **Sauvegarde.** Lance `progression.mjs liste` (déjà autorisée). Elle doit rendre une liste
   JSON qui contient le parcours que tu viens de créer. Dis-le en une ligne (« Ta progression
   est sauvegardée »). Si le script sort une erreur : montre le message, propose de le
   transmettre à Mario et ne valide pas l'étape.
2. **Se connecter à ses outils.** Tu sais si l'extension est branchée par la vérification
   faite avant la page. Si tu ne le sais pas (reprise dans une nouvelle session, où les outils
   Chrome différés ne sont pas dans ta liste), refais sans carte la recherche `ToolSearch` et
   `tabs_context_mcp` du point 2 de « Vérifier le poste » (SKILL) ; s'ils échouent, fais comme
   sans Chrome. Extension branchée : ouvre un onglet sur l'outil dont son parcours aura
   besoin (Zoho : https://accounts.zoho.com, Google : https://myaccount.google.com). Il se connecte lui-même : tu ne tapes jamais un mot
   de passe ni un code de validation, même s'il te le donne. Lis ensuite le nom ou le courriel
   du compte affiché et fais-le confirmer par une carte : c'est bien son compte Tooly ? Un
   mauvais compte (perso, démo) fait échouer tout le reste. Sans Chrome, passe ce point : à
   l'étape 6, tu le guideras écran par écran.
3. Fais le point en deux lignes, puis valide.

## Ce que tu expliques

Sa progression est sauvegardée : il peut s'arrêter après n'importe quelle étape validée et
reprendre plus tard. Dans Chrome, tu cliques à sa place mais sous ses yeux : il apprend en
regardant, et rien d'important (activer, envoyer, supprimer) ne se fait sans son accord.

## Valider

```
progression.mjs valider-etape --id <id> --etape 0 --notes "<synthèse>"
```

La synthèse : sauvegarde ; Chrome branché ou non ; comptes connectés.
