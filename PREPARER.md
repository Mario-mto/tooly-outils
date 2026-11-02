# Préparer le poste pour le coach d'automatisation de Tooly

Cette procédure s'adresse à toi, Claude. Un employé de Tooly, débutant, te l'a fait lire depuis
l'onglet Code de l'application Claude. Il veut que son ordinateur (Windows ou Mac) soit prêt pour
le coach d'automatisation. Suis les étapes dans l'ordre, sans en sauter, et fais tout toi-même :
il n'ouvre jamais de terminal et ne tape aucune commande.

## 1. Le ton, du premier au dernier message

- Français, tutoiement, phrases courtes. Aucun message en anglais, même pour une erreur, une
  attente ou le résultat d'une commande : reformule-le en français.
- Tu parles de toi au masculin (« je suis prêt », « je l'ai vérifié »).
- Un geste manuel par message. Pour chacun, dis ce qu'il va voir et où cliquer, avec les mots de
  l'écran (« en haut à droite de Chrome, l'icône en forme de pièce de puzzle »).
- Ne lui demande de confirmer que ce que tu ne peux pas constater toi-même. Le reste, vérifie-le
  par une commande.
- Ne dis jamais « installé » ou « prêt » sans l'avoir vérifié par une commande juste avant.
- Avant chaque commande, l'application lui demandera la permission : c'est normal, il répond
  « Autoriser ».

## 2. Annonce le chemin

Ton premier message tient en trois lignes, à peu près :

> Je vais vérifier ce dont le coach a besoin sur ton ordinateur : git (sur Mac, les outils
> Apple qui l'apportent), Node, le coach lui-même et l'extension Claude pour Chrome.
> Tu n'as rien à taper : je lance les commandes, tu cliques seulement « Autoriser » quand je te demande
> la permission.
> S'il faut installer quelque chose, il y aura un seul redémarrage de Chrome et de Claude, à la
> fin : le coach et l'extension n'apparaissent qu'après.

## 3. Reconnais le système

Ton environnement te donne déjà la plateforme (`win32` pour Windows, `darwin` pour Mac). Dans le
doute : `uname -s` dans Bash (`Darwin` pour un Mac), ou `$env:OS` dans PowerShell (`Windows_NT`,
une des deux exceptions à la règle « jamais une variable » de l'étape 4). Rien d'autre. Si ce n'est ni Windows ni Mac, dis-le et arrête-toi : la procédure ne couvre que
ces deux systèmes.

Sous Windows, dans PowerShell, écris toujours `curl.exe`, jamais `curl` seul (c'est un autre
programme). Sur Mac, ne lance jamais `git`, sous aucune forme, tant que l'étape 4 n'a pas montré
que les outils Apple sont là.

## 4. Vérifie tout d'abord, sans rien installer

Une commande simple à la fois. Note le résultat de chacune.

**D'abord, les chemins.** Une seule commande lit les variables utiles, sans écrire de `$` (une
commande qui contient une variable ne peut pas être contrôlée d'avance et redemande la
permission à chaque fois). Ensuite, écris toujours les chemins en toutes lettres dans tes
commandes, jamais une variable. Seules exceptions : `$env:OS` (étape 3) et `$env:Path` quand git
vient d'être installé sous Windows (étape 5, « Le coach ») ; elles demandent la permission, c'est
normal.

- Bash : `printenv | grep -E '^(CLAUDE_CODE_EXECPATH|CLAUDE_PID|CLAUDE_CONFIG_DIR|HOME)='`
- PowerShell : `Get-ChildItem Env:CLAUDE_CODE_EXECPATH, Env:CLAUDE_PID, Env:CLAUDE_CONFIG_DIR, Env:USERPROFILE, Env:LOCALAPPDATA -ErrorAction SilentlyContinue`

Une variable absente de la réponse est vide. En PowerShell, la commande rend un code d'erreur
dès qu'une variable manque (souvent `CLAUDE_CONFIG_DIR`) : c'est normal, ce n'est pas un échec.
Lis les lignes qu'elle affiche.

Tu en tires deux choses :

- **Le programme Claude** (les commandes `plugin` passent par lui) : le chemin de
  `CLAUDE_CODE_EXECPATH`. S'il est vide : sous Windows, `(Get-Process -Id <CLAUDE_PID>).Path`
  dans PowerShell ; sur Mac, `ps -o comm= -p <CLAUDE_PID>`. Sous Windows sans git (pas de Bash,
  seulement PowerShell), `CLAUDE_CODE_EXECPATH` manque presque toujours : ce repli par
  `CLAUDE_PID` est alors le cas normal, pas une exception. En dernier recours, `claude` s'il
  répond. Dans la suite, `CLAUDE` désigne ce chemin complet, entre guillemets (PowerShell :
  `& "<chemin>"`).
- **Le dossier de réglages de Claude** : celui de `CLAUDE_CONFIG_DIR` s'il n'est pas vide, sinon
  `.claude` dans le dossier de l'utilisateur. C'est là qu'est `settings.json` (étape 5, « Le
  réglage »). Ne prends pas l'autre quand `CLAUDE_CONFIG_DIR` est rempli.

Lire le dossier de Chrome ou ce dossier de réglages demande aussi la permission : c'est normal.

**Mac :**

1. Outils Apple : `xcode-select -p`. Un chemin s'affiche : ils sont là. Une erreur : ils manquent.
   Jamais `git --version` avant que cette commande ait réussi : sans les outils Apple, elle ouvre
   une fenêtre d'Apple que tu n'aurais pas annoncée.
2. Seulement si le point 1 a réussi : `git --version`.
3. Node : `node --version`.
4. Le coach : `CLAUDE plugin list`. Il est là si la liste contient `coach-automatisation@tooly-outils`.
5. Chrome : `ls -d "/Applications/Google Chrome.app"`.
6. L'extension : `ls -d ~/Library/Application\ Support/Google/Chrome/*/Extensions/fcoeoabgfenejglbffodgkkbkcdhcgfn`.
7. Le réglage d'autocompaction : lis le fichier de réglages (voir l'étape 5, « Le réglage ») et
   regarde s'il contient `autoCompactWindow`.

**Windows :**

1. git : `git --version`.
2. Node : `node --version`.
3. Le coach : `CLAUDE plugin list`, même critère que sur Mac.
4. Chrome : `Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe"` ; si c'est
   `False`, le même chemin sous `C:\Program Files (x86)` puis sous le dossier `LOCALAPPDATA` lu
   plus haut.
5. L'extension : `Test-Path "<LOCALAPPDATA>\Google\Chrome\User Data\*\Extensions\fcoeoabgfenejglbffodgkkbkcdhcgfn"`,
   avec le chemin `LOCALAPPDATA` lu plus haut écrit en toutes lettres.
6. Le réglage d'autocompaction : comme sur Mac.

**La version du coach** (Mac et Windows), seulement s'il est déjà là :

- La version installée : la ligne `Version:` sous `coach-automatisation@tooly-outils` dans
  `CLAUDE plugin list`.
- La version du catalogue :
  `curl -fsSL https://raw.githubusercontent.com/Mario-mto/tooly-outils/main/plugins/coach-automatisation/.claude-plugin/plugin.json`
  (sous Windows dans PowerShell : `curl.exe`), champ `"version"`.
- Compare nombre par nombre (`0.1.0` est plus ancienne que `0.2.0`). Plus ancienne : le coach
  est à mettre à jour (étape 5, « Le coach »). Même version : il est en place.

Puis dis-lui en une courte liste ce qui est déjà là et ce qui manque (un coach à mettre à jour
compte comme un manque).

**Tout est là, coach à jour compris ?** Va directement à la section « Poste déjà prêt », en bas.

## 5. Installe ce qui manque, dans cet ordre

Saute ce qui est déjà là. Avant chaque geste, annonce la fenêtre qu'il va voir.

**Mac, les outils Apple** (ils apportent git) :

- Annonce : « Une fenêtre d'Apple va s'ouvrir. Clique « Installer », puis « Accepter ». Ça prend
  quelques minutes. Dis-moi quand elle affiche que c'est terminé. »
- Lance `xcode-select --install`. S'il répond que c'est déjà installé ou déjà en cours, dis-le
  tel quel, en français.
- Pendant l'attente, tu peux télécharger l'installeur de Node (ci-dessous), qui n'a pas besoin
  de git. Télécharger seulement : ne l'ouvre qu'une fois les outils Apple installés, pour
  qu'il n'y ait jamais deux fenêtres d'installation en même temps.
- Quand il dit que c'est fini : `xcode-select -p`. Tant que ça échoue, ne dis pas « installé » :
  dis ce que tu vois et attends. Une fois réussi, `git --version` pour le constater.

**Windows, git :**

- Annonce : « Windows va te demander si tu autorises l'installation. Clique « Oui ». »
- Lance `winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements`,
  avec un long délai d'attente pour la commande (10 minutes) : le téléchargement peut être lent.
- Vérifie : `& "C:\Program Files\Git\cmd\git.exe" --version`. (Le simple `git` ne répondra
  qu'après le redémarrage, c'est normal.)
- Si `winget` n'existe pas : donne-lui le lien https://git-scm.com/download/win, dis-lui de
  télécharger, d'ouvrir le fichier et de garder les choix proposés, puis vérifie de la même façon.

**Node**, jamais par nvm, Homebrew, ni un script envoyé à `bash` :

- Windows : annonce la fenêtre « Oui » de Windows, puis
  `winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements`,
  avec un délai d'attente de 10 minutes pour la commande.
  Vérifie : `& "C:\Program Files\nodejs\node.exe" --version`.
- Mac : trouve la dernière version LTS :
  `curl -fsSL https://nodejs.org/dist/index.tab | awk -F'\t' 'NR>1 && $10!="-" {print $1; exit}'`
  (elle donne par exemple `v26.13.0`). Télécharge l'installeur officiel (environ 100 Mo, délai
  d'attente de 10 minutes pour la commande) dans `/tmp`, pas dans Téléchargements : macOS
  protège ce dossier et ouvrirait une fenêtre d'autorisation non annoncée.
  `curl -fL -o /tmp/node-<version>.pkg https://nodejs.org/dist/<version>/node-<version>.pkg`.
  Annonce : « L'installeur de Node va s'ouvrir. Clique « Continuer » à chaque écran, puis
  « Installer ». Le Mac te demande ton mot de passe : c'est toi qui le tapes, jamais moi. Dis-moi
  quand il affiche que c'est réussi. » Puis `open /tmp/node-<version>.pkg`.
  Quand il a fini : `/usr/local/bin/node --version`.

**Le coach** (il a besoin de git : sur Mac, attends que `xcode-select -p` réussisse). S'il
manque :

1. `CLAUDE plugin marketplace add Mario-mto/tooly-outils`. S'il répond que le catalogue existe
   déjà, passe au point 2.
2. `CLAUDE plugin install coach-automatisation@tooly-outils`.
3. Vérifie : `CLAUDE plugin list` contient `coach-automatisation@tooly-outils`.

Sous Windows, si git vient d'être installé, mets-le dans le chemin de la même commande (c'est
l'exception à « jamais une variable ») :
`$env:Path = "C:\Program Files\Git\cmd;" + $env:Path; & "<chemin de CLAUDE>" plugin marketplace add Mario-mto/tooly-outils`.

Le coach est là mais plus ancien que le catalogue (étape 4, « La version du coach ») : mets-le
à jour au lieu de l'installer.

1. `CLAUDE plugin marketplace update tooly-outils`.
2. `CLAUDE plugin update coach-automatisation@tooly-outils`.
3. Vérifie : la ligne `Version:` de `CLAUDE plugin list` est maintenant celle du catalogue. Sinon,
   ne dis pas « à jour » : dis ce que tu vois.

**L'extension Claude pour Chrome**, un geste par message, en attendant son « c'est fait » à
chaque fois :

1. Pas de Chrome ? Lien : https://www.google.com/chrome/ . Il télécharge, ouvre le fichier et
   suit l'installation. Puis, dans Chrome, il se connecte à claude.ai avec son compte Tooly
   (jamais un compte perso ou de démo).
2. Il ouvre ce lien dans Chrome, clique « Ajouter à Chrome », puis « Ajouter l'extension » :
   https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn .
   Si le lien s'ouvre dans un autre navigateur : le copier et le coller dans la barre d'adresse
   de Chrome.
3. En haut à droite de Chrome, l'icône en forme de pièce de puzzle, puis la punaise à côté de
   Claude : l'icône de Claude reste visible.
4. Il clique l'icône de Claude et se connecte avec son compte Tooly, le même que dans
   l'application Claude. Il accepte ce qu'elle demande d'autoriser.

Vérifie ensuite que le dossier de l'extension existe (commande de l'étape 4). Qu'elle soit
branchée à Claude ne se voit qu'après le redémarrage : le coach le vérifiera.
Le guide illustré de ce geste : https://claude.ai/artifact/Uw6njsQH9pESbLGxv9jkfD#chrome
(geste 3, « Chrome et l'extension Claude »).

**Le réglage d'autocompaction** (pendant les longues séances, Claude allège la conversation tout
seul) :

- Le fichier : `settings.json` dans le dossier de réglages trouvé à l'étape 4 (d'ordinaire
  Windows : `C:\Users\<nom>\.claude\settings.json` ; Mac : `~/.claude/settings.json`). Lis-le
  et modifie-le avec tes outils de lecture et d'écriture de fichiers, pas par une commande.
- Annonce : « J'ajoute un réglage dans tes réglages Claude : la conversation s'allégera toute
  seule pendant les longues séances. Je ne touche à rien d'autre. »
- Relis-le juste avant d'écrire, même si tu l'as lu à l'étape 4 : l'installation du coach le
  crée ou le modifie (elle y range l'activation du coach). Ce que tu as vu avant n'est plus vrai.
- Le fichier existe : ajoute ou remplace la seule clé `"autoCompactWindow": 300000` (un nombre,
  sans guillemets) par une modification ciblée, et garde tout le reste tel quel. Ne réécris
  jamais le fichier entier : tu effacerais l'activation du coach.
- Il n'existe toujours pas à cette relecture : crée-le avec `{ "autoCompactWindow": 300000 }`.
- Relis-le ensuite pour vérifier que la clé y est et que le fichier reste du JSON valide.
- Ne touche jamais au fichier `.claude.json` ni à aucun autre réglage.

## 6. Revérifie

Relance la commande de vérification de chaque chose installée. Ne dis « prêt » que sur ces
preuves, et dis-lui en une ligne ce que chacune a montré.

## 7. Le redémarrage, une seule fois

Seulement si tu as installé git, Node, le coach ou l'extension, ou mis à jour le coach. (Le
réglage seul n'en demande pas.) Dis-lui :

- Windows : « Ferme toutes les fenêtres de Chrome. Ferme l'application Claude. Puis regarde près
  de l'horloge, en bas à droite (parfois sous la petite flèche) : si l'icône de Claude y est
  encore, clic droit dessus, puis Quitter. »
- Mac : « Dans Chrome, appuie sur Cmd + Q. Dans l'application Claude, Cmd + Q aussi. Fermer la
  fenêtre ne suffit pas. »
- Puis : « Rouvre Chrome, puis l'application Claude, onglet Code, et tape
  `/coach-automatisation:coach`. »

## 8. Si un geste coince

Demande-lui une capture d'écran : Windows + Maj + S, puis Ctrl + V dans la conversation ; sur
Mac, Cmd + Maj + 4, puis glisse l'image du bureau dans la conversation. Donne aussi le lien du
guide illustré : https://claude.ai/artifact/Uw6njsQH9pESbLGxv9jkfD#chrome

## Poste déjà prêt

Si l'étape 4 montre que tout est là (git, Node, le coach à la même version que le catalogue,
Chrome et l'extension), n'installe rien. Si seul le réglage d'autocompaction manque, ajoute-le
(étape 5, « Le réglage »), sans redémarrage. Puis dis :

> Ton poste est prêt : git, Node, le coach et l'extension Chrome sont en place. Pas besoin de
> redémarrer. Tape `/coach-automatisation:coach` pour commencer.

Le coach est plus ancien que le catalogue ? Le poste n'est pas prêt : mets-le à jour (étape 5,
« Le coach »), revérifie sa version, puis annonce le redémarrage unique (étape 7).

## Jamais

- Ouvrir un terminal pour lui, ou lui faire taper une commande.
- nvm, Homebrew, ou un script téléchargé et envoyé à `bash`.
- Taper un mot de passe à sa place.
- Sur Mac, lancer `git` avant que `xcode-select -p` ait réussi.
- Dire « installé » sans l'avoir vérifié.
- Un deuxième redémarrage, ou un redémarrage non annoncé.
- Écrire en anglais.
