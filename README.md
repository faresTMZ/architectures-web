# Architectures Web

Dans ce cours, nous allons voir les différentes architectures web qui existent. Nous allons voir les avantages et les inconvénients de chacune d'entre elles.

Pour chaque architecture, vous allez pouvoir retrouver un exemple simple pour mieux comprendre comment cela fonctionne. Pour le lancer en local, il suffit d'exécuter la commande `make` dans le dossier de l'architecture que vous souhaitez tester, ou `make run-0`, `make run-1`, `make run-2`... pour lancer la démo de l'architecture de votre choix.

Les commandes lançent les projets en mode prod et non développement : il faut redémarrer le serveur à chaque modification. C'est volontaire, pour que les exemples soient plus proches de la réalité, simples à comprends et non pollués par des outils de développement.

## TD fil rouge

Pour ce TD, vous allez devoir réaliser une application web simple, qui permet de gérer une liste de recettes. Vous allez devoir réaliser cette application en utilisant une des architectures que nous avons vu en cours.

Elle se basera sur une API REST qui permettra de gérer les recettes. Vous devrez réaliser une interface web qui permettra d'interagir avec cette API.

- API : https://gourmet.cours.quimerch.com (elle fournit aussi une interface utilisateur et des routes admin, mais vous n'avez pas besoin de les utiliser)
- OpenAPI (description des routes existantes et disponibles) : https://gourmet.cours.quimerch.com/swagger/index.html

### Fonctionnalités demandées

- PAGE `/` : Afficher la liste des recettes disponibles
- PAGE `/recettes/{recetteID}` : Afficher une recette en particulier
- Se connecter avec son compte utilisateur (un user/mdp vous sera donné)
- Se déconnecter de son compte utilisateur
- Ajouter une recette à ses favoris
- Supprimer une recette de ses favoris
- PAGE `/favorites` Voir la liste de ses recettes favorites

### Contraintes

- Utiliser Docker pour déployer votre application
  - Construisez votre image à partir d'un Dockerfile, vous pouvez demander de l'aide si besoin
  - Votre app écoute sur le port 80
  - Construite pour linux/amd64
  - non-root (unprivileged) sauf dérogation si impossible de faire autrement
  - A publier sur un Image Registry (DockerHub, Github Container Registry, AWS ECR, GCR...)
- Utiliser Git pour versionner votre code
- Utiliser une des architectures vues en cours
  - **Recommendé**
    - React (Dockerfile fourni)
    - Next.js (Dockerfile fourni)
    - Astro (Dockerfile fourni)
  - Je peux **aussi** vous noter sur les technologies suivantes. Cependant, je ne pourrai pas vous aider si vous avez des problèmes avec celles-ci. C'est à vos risques et périls!
    - Vue / Nuxt
    - Svelte / SvelteKit
    - Templating (Django, Go, Ruby on Rails, PHP)

### Évaluation

- 20% Répondre aux exigences (features demandées, pas de crashs)
- 10% Bonne UX/UI
- 10% Code de qualité
- 20% Performance
- 20% Sécurité
- 20% Pratiques professionnelles (tests, CI/CD, documentation, etc...)

Toute initiative est la bienvenue, tant que les fonctionnalités demandées sont bien implémentées. Si vous avez des idées pour améliorer l'application, n'hésitez pas à les implémenter!

### Groupes et suivi TD

Voir [ce tableur](https://docs.google.com/spreadsheets/d/1shCI6NBOLrC_3sfzv9q0GupgE1JmD5wJv8AmuVOCqAk/edit?usp=sharing)

Envoyez moi un message pour inscrire votre groupe. J'ai besoin de vos noms dans un premier temps, puis renvoyez moi un message pour remplir le lien github et le lien vers votre image docker.
