# Étape 6 : construire avec Claude

## But

Construire l'automatisation dans la forme choisie. Tu construis tout ; il comprend ce que fait
chaque morceau et quels accès il utilise.

## Concept du socle à vérifier

- `acces-secrets` : accès et secrets.

## Ce que tu fais

1. Rappelle le découpage de l'étape 4 : tu construis étape par étape, dans cet ordre.
2. Range ce que tu produis dans un dossier de l'automatisation (par exemple
   `Documents/automatisations/<titre>/`) : code, réglages, et plus tard la fiche. Demande-lui
   l'emplacement par une carte (ta proposition en premier).
3. Selon la forme :
   - **Routine Claude planifiée** : écris les instructions de la routine (et la skill qu'elle
     appelle s'il en faut une), puis crée la routine avec son heure fixe. Montre-lui où la voir.
   - **Zoho Flow, Deluge** (interfaces web à clics) : prépare tout (code Deluge commenté,
     réglages du flux). Si Chrome est branché (étape 0), construis-le toi-même dans son Chrome,
     sous ses yeux. Sur la page, un écran `travail` (`parcours.etape` 6) : la liste de ce que tu
     vas faire, une ligne par action, que tu coches au fur et à mesure (`page.md`), et dans
     `pourTaTache.lignes` le pourquoi de l'action en cours :
     - avant d'ouvrir la page, dis-lui ce qu'il va voir bouger, et explique chaque écran en une
       ligne pendant que tu y travailles (« ici je choisis l'heure du lundi ») ;
     - vérifie d'abord que le compte connecté est son compte Tooly ; une page de connexion ou un
       code de validation, c'est lui qui s'en occupe ;
     - pour coller du code dans un éditeur web, passe par le presse-papiers (Ctrl+A puis Ctrl+V
       dans l'éditeur), en annonçant la commande de copie ;
     - reprends une capture avant chaque clic : les boutons bougent quand la fenêtre change ;
     - laisse le flux désactivé : l'activer, c'est l'étape 7, avec son accord.
     Sans Chrome, guide-le pas à pas, un écran à la fois : où cliquer, quoi coller, quoi
     choisir ; il colle et clique, et décrit ou capture chaque écran important.
   - **Tâche planifiée Windows** : prépare la commande, explique-la en clair, puis crée la tâche
     avec son accord ; montre-lui où la voir dans le Planificateur de tâches.
   - **Mini-appli** : construis la page et ses données, publie-la en privé, donne-lui le lien.
4. Accès : n'utilise que les accès nécessaires, et dis lesquels. Aucune clé ni mot de passe en
   clair dans un fichier (`garde-fous.md`) : connexion gérée par l'outil, connecteur, ou variable
   d'environnement.
5. Ne lance rien sur des données réelles à cette étape : les essais, c'est l'étape 7.
6. Vérifie le concept par une carte, sur ce que tu viens de construire. Exemple : « Ton flux a
   besoin d'écrire dans Zoho CRM. Où doit vivre l'autorisation ? », avec la bonne réponse (la
   connexion Zoho du flux) et des distracteurs plausibles (« dans le code Deluge, en clair »).

## Ce que tu expliques

L'automatisation agit avec ses accès à lui : elle peut faire tout ce qu'il peut faire. Moins elle
a d'accès, moins une erreur fait de dégâts. Une clé en clair dans un fichier finit par fuiter.

## Valider

Seulement quand l'automatisation existe vraiment, et que tu l'as constaté : le flux enregistré
vu dans Chrome, la routine listée, la tâche visible dans le Planificateur, ou une capture de
lui. Des cartes répondues ne suffisent pas. Dans les notes, n'écris que ce que tu as vu (accès
réellement accordés, pas ceux que tu voulais).

`progression.mjs valider-etape --id <id> --etape 6 --notes "<synthèse ; dossier : chemin complet>"`
