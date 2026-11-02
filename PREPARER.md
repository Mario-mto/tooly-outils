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
  « Oui ».

## 2. Annonce le chemin

Ton premier message tient en trois lignes, à peu près :

> Je vais vérifier ce dont le coach a besoin sur ton ordinateur : git (sur Mac, les outils
> Apple qui l'apportent), Node, le coach lui-même et l'extension Claude pour Chrome.
> Tu n'as rien à taper : je lance les commandes, tu cliques seulement « Oui » quand je te demande
> la permission.
> S'il faut installer quelque chose, il y aura un seul redémarrage de Chrome et de Claude, à la
> fin : le coach et l'extension n'apparaissent qu'après.

## 3. Reconnais le système

Ton environnement te donne déjà la plateforme (`win32` pour Windows, `darwin` pour Mac). Dans le
doute : `uname -s` dans Bash (`Darwin` pour un Mac), ou `$env:OS` dans PowerShell (`Windows_NT`).
Rien d'autre. Si ce n'est ni Windows ni Mac, dis-le et arrête-toi : la procédure ne couvre que
ces deux systèmes.

Sous Windows, dans PowerShell, écris toujours `curl.exe`, jamais `curl` seul (c'est un autre
programme). Sur Mac, ne lance jamais `git`, sous aucune forme, tant que l'étape 4 n'a pas montré
que les outils Apple sont là.

## 4. Vérifie tout d'abord, sans rien installer

Une commande simple à la fois. Note le résultat de chacune.

**Le programme Claude.** Les commandes `plugin` passent par le programme Claude en cours. Trouve
son chemin dans cet ordre et garde-le pour la suite :

- la variable `CLAUDE_CODE_EXECPATH` (Bash : `echo "$CLAUDE_CODE_EXECPATH"`) ;
- si elle est vide, sous Windows : `(Get-Process -Id $env:CLAUDE_PID).Path` dans PowerShell ;
  sur Mac : `ps -o comm= -p "$CLAUDE_PID"` ;
- en dernier recours, `claude` s'il répond.

Dans la suite, `CLAUDE` désigne ce chemin complet, entre guillemets (PowerShell : `& "<chemin>"`).

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
4. Chrome : `Test-Path "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"`, ou le même
   chemin sous `${env:ProgramFiles(x86)}` ou `$env:LOCALAPPDATA`.
5. L'extension : `Test-Path "$env:LOCALAPPDATA\Google\Chrome\User Data\*\Extensions\fcoeoabgfenejglbffodgkkbkcdhcgfn"`.
6. Le réglage d'autocompaction : comme sur Mac.

Puis dis-lui en une courte liste ce qui est déjà là et ce qui manque.

**Tout est là ?** Va directement à la section « Poste déjà prêt », en bas.

## 5. Installe ce qui manque, dans cet ordre

Saute ce qui est déjà là. Avant chaque geste, annonce la fenêtre qu'il va voir.

**Mac, les outils Apple** (ils apportent git) :

- Annonce : « Une fenêtre d'Apple va s'ouvrir. Clique « Installer », puis « Accepter ». Ça prend
  quelques minutes. Dis-moi quand elle affiche que c'est terminé. »
- Lance `xcode-select --install`. S'il répond que c'est déjà installé ou déjà en cours, dis-le
  tel quel, en français.
- Pendant l'attente, tu peux préparer Node (ci-dessous) : son téléchargement n'a pas besoin de
  git.
- Quand il dit que c'est fini : `xcode-select -p`. Tant que ça échoue, ne dis pas « installé » :
  dis ce que tu vois et attends. Une fois réussi, `git --version` pour le constater.

**Windows, git :**

- Annonce : « Windows va te demander si tu autorises l'installation. Clique « Oui ». »
- Lance `winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements`.
- Vérifie : `& "$env:ProgramFiles\Git\cmd\git.exe" --version`. (Le simple `git` ne répondra
  qu'après le redémarrage, c'est normal.)
- Si `winget` n'existe pas : donne-lui le lien https://git-scm.com/download/win, dis-lui de
  télécharger, d'ouvrir le fichier et de garder les choix proposés, puis vérifie de la même façon.

**Node**, jamais par nvm, Homebrew, ni un script envoyé à `bash` :

- Windows : annonce la fenêtre « Oui » de Windows, puis
  `winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements`.
  Vérifie : `& "$env:ProgramFiles\nodejs\node.exe" --version`.
- Mac : trouve la dernière version LTS :
  `curl -fsSL https://nodejs.org/dist/index.tab | awk -F'\t' 'NR>1 && $10!="-" {print $1; exit}'`
  (elle donne par exemple `v26.13.0`). Télécharge l'installeur officiel :
  `curl -fL -o ~/Downloads/node-<version>.pkg https://nodejs.org/dist/<version>/node-<version>.pkg`.
  Annonce : « L'installeur de Node va s'ouvrir. Clique « Continuer » à chaque écran, puis
  « Installer ». Le Mac te demande ton mot de passe : c'est toi qui le tapes, jamais moi. Dis-moi
  quand il affiche que c'est réussi. » Puis `open ~/Downloads/node-<version>.pkg`.
  Quand il a fini : `/usr/local/bin/node --version`.

**Le coach** (il a besoin de git : sur Mac, attends que `xcode-select -p` réussisse) :

1. `CLAUDE plugin marketplace add Mario-mto/tooly-outils`. S'il répond que le catalogue existe
   déjà, passe au point 2.
2. `CLAUDE plugin install coach-automatisation@tooly-outils`.
3. Vérifie : `CLAUDE plugin list` contient `coach-automatisation@tooly-outils`.

Sous Windows, si git vient d'être installé, mets-le dans le chemin de la même commande :
`$env:Path = "$env:ProgramFiles\Git\cmd;$env:Path"; & "<chemin de CLAUDE>" plugin marketplace add Mario-mto/tooly-outils`.

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
Le guide illustré de ce geste : https://claude.ai/artifact/Uw6njsQH9pESbLGxv9jkfD#installer
(geste 3, « Chrome et l'extension Claude »).

**Le réglage d'autocompaction** (pendant les longues séances, Claude allège la conversation tout
seul) :

- Le fichier : `settings.json` dans le dossier de réglages de Claude, c'est-à-dire le dossier de
  la variable `CLAUDE_CONFIG_DIR` si elle existe, sinon `.claude` dans le dossier de l'utilisateur
  (Windows : `%USERPROFILE%\.claude\settings.json` ; Mac : `~/.claude/settings.json`).
- Annonce : « J'ajoute un réglage dans tes réglages Claude : la conversation s'allégera toute
  seule pendant les longues séances. Je ne touche à rien d'autre. »
- Le fichier existe : lis-le, ajoute ou remplace la seule clé `"autoCompactWindow": 300000`
  (un nombre, sans guillemets), garde tout le reste tel quel. Ne remplace jamais le fichier entier.
- Il n'existe pas : crée-le avec `{ "autoCompactWindow": 300000 }`.
- Relis-le ensuite pour vérifier que la clé y est et que le fichier reste du JSON valide.
- Ne touche jamais au fichier `.claude.json` ni à aucun autre réglage.

## 6. Revérifie

Relance la commande de vérification de chaque chose installée. Ne dis « prêt » que sur ces
preuves, et dis-lui en une ligne ce que chacune a montré.

## 7. Le redémarrage, une seule fois

Seulement si tu as installé git, Node, le coach ou l'extension. (Le réglage seul n'en demande
pas.) Dis-lui :

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
guide illustré : https://claude.ai/artifact/Uw6njsQH9pESbLGxv9jkfD#installer

## Poste déjà prêt

Si l'étape 4 montre que tout est là (git, Node, le coach, Chrome et l'extension), n'installe
rien. Si seul le réglage d'autocompaction manque, ajoute-le (étape 5, « Le réglage »), sans
redémarrage. Puis dis :

> Ton poste est prêt : git, Node, le coach et l'extension Chrome sont en place. Pas besoin de
> redémarrer. Tape `/coach-automatisation:coach` pour commencer.

## Jamais

- Ouvrir un terminal pour lui, ou lui faire taper une commande.
- nvm, Homebrew, ou un script téléchargé et envoyé à `bash`.
- Taper un mot de passe à sa place.
- Sur Mac, lancer `git` avant que `xcode-select -p` ait réussi.
- Dire « installé » sans l'avoir vérifié.
- Un deuxième redémarrage, ou un redémarrage non annoncé.
- Écrire en anglais.
