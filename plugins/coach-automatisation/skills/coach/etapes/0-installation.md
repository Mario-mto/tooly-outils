# Étape 0 : préparer son poste

## But

Au premier parcours, mettre en place ce qui rendra la suite fluide : la sauvegarde de sa
progression, Chrome où tu travailleras sous ses yeux, et une conversation qui s'allège toute
seule. L'installation de Claude Code, de Node et du plugin se fait avec le guide
`docs/guide-installation.md` du dépôt du coach : si le coach tourne, ils sont en place. Pas de
concept du socle à vérifier ici.

Cette étape peut demander une relance du coach. Si tu y reviens après une relance, ne refais
pas ce qui est déjà en place : reprends au point suivant.

## Ce que tu fais

1. **Sauvegarde.** Lance `progression.mjs liste` (déjà autorisée). Elle doit rendre une liste
   JSON qui contient le parcours que tu viens de créer. Dis-le en une ligne (« Ta progression
   est sauvegardée »). Si le script sort une erreur : montre le message, propose de le
   transmettre à Mario et ne valide pas l'étape.
2. **Chrome est-il déjà branché ?** Cherche dans ta session les outils `mcp__claude-in-chrome__`
   et lance `tabs_context_mcp`. S'il répond, passe au point 5.
3. **Installer l'extension.** Explique en deux lignes pourquoi : tu pourras ouvrir ses outils
   (Zoho, Google) dans son Chrome et y travailler à sa place ; il voit tout ce que tu fais et
   peut reprendre la main à tout moment. Puis guide-le, un geste à la fois :
   - ouvrir dans Chrome
     https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn et
     cliquer « Ajouter à Chrome » ;
   - se connecter dans l'extension avec le même compte Claude que Claude Code ;
   - épingler l'extension (icône de pièce de puzzle, puis la punaise), pour la voir.
   Carte « Où en es-tu ? » : « L'extension est installée et connectée », « Je bloque » (aide-le
   à partir de ce qu'il voit), « Je n'ai pas Chrome » (passe au point 4 sans Chrome : à
   l'étape 6, tu le guideras écran par écran).
4. **Deux réglages, une relance.** Il tape lui-même ces commandes dans la fenêtre de Claude
   Code, dans l'ordre. Sur la page, une commande par `bandeau` (`aTaper` = la commande exacte,
   `texte` = l'explication en une ligne) : son « C'est fait » te réveille et tu affiches la
   suivante. Explique chacune en une ligne avant :
   - `/autocompact 300k` : quand la conversation devient très longue, Claude Code la résume
     tout seul pour rester précis et économe ;
   - `/chrome`, puis choisir « Enabled by default » : Claude Code se branche à son Chrome,
     maintenant et aux prochaines fois (sans Chrome, il saute cette commande) ;
   - `/coach-automatisation:coach` : tu reprends ici, rien n'est perdu. Pas de bandeau pour la
     relance (un « C'est fait » sonnerait pendant que tu es coupé) : écris d'abord
     l'écran `relance` avec cette commande, puis dis-le dans la fenêtre de Claude Code ; à la
     reprise, suis « Reprendre » de `page.md`.
   Termine ton message là : il a la main pour taper.
5. **Se connecter à ses outils.** Après la relance, vérifie Chrome avec `tabs_context_mcp`.
   Ouvre un onglet sur l'outil dont son parcours aura besoin (Zoho : https://accounts.zoho.com,
   Google : https://myaccount.google.com). Il se connecte lui-même : tu ne tapes jamais un mot
   de passe ni un code de validation, même s'il te le donne. Lis ensuite le nom ou le courriel
   du compte affiché et fais-le confirmer par une carte : c'est bien son compte Tooly ? Un
   mauvais compte (perso, démo) fait échouer tout le reste.
6. Fais le point en deux lignes, puis valide.

## Ce que tu expliques

Sa progression est sauvegardée : il peut s'arrêter après n'importe quelle étape validée et
reprendre plus tard. Dans Chrome, tu cliques à sa place mais sous ses yeux : il apprend en
regardant, et rien d'important (activer, envoyer, supprimer) ne se fait sans son accord.

## Valider

`progression.mjs valider-etape --id <id> --etape 0 --notes "<sauvegarde ; Chrome branché ou non ; autocompaction ; comptes connectés>"`
