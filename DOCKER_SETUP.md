# 🐳 Guide de Configuration Docker

Ce guide vous explique comment installer Docker et construire/publier votre image.

## 📦 Installation de Docker Desktop

### macOS (votre système actuel)

1. **Télécharger Docker Desktop pour Mac**
   - Visitez : https://www.docker.com/products/docker-desktop/
   - Cliquez sur "Download for Mac"
   - Choisissez la version correspondant à votre puce :
     - **Apple Silicon (M1/M2/M3)** : Docker Desktop for Mac with Apple silicon
     - **Intel** : Docker Desktop for Mac with Intel chip

2. **Installer**
   - Ouvrez le fichier `.dmg` téléchargé
   - Glissez Docker.app dans Applications
   - Lancez Docker Desktop depuis Applications
   - Acceptez les conditions et autorisez les permissions

3. **Vérifier l'installation**
   ```bash
   docker --version
   docker compose version
   ```

### Windows

1. Téléchargez Docker Desktop : https://www.docker.com/products/docker-desktop/
2. Lancez l'installateur
3. Suivez les instructions (WSL 2 sera installé si nécessaire)
4. Redémarrez votre ordinateur
5. Lancez Docker Desktop

### Linux (Ubuntu/Debian)

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER

# Redémarrer la session ou exécuter
newgrp docker

# Vérifier
docker --version
```

---

## 🛠️ Construire l'image localement

### 1. Build de base
```bash
docker build -t mon-app-recettes:latest .
```

### 2. Tester localement
```bash
# Lancer le conteneur
docker run -p 8080:80 mon-app-recettes:latest

# Accédez à http://localhost:8080
```

### 3. Arrêter le conteneur
```bash
# Lister les conteneurs en cours
docker ps

# Arrêter un conteneur
docker stop <CONTAINER_ID>
```

---

## 📤 Publier automatiquement via GitHub Actions (DockerHub)

### Configuration (une seule fois)

Le job `DockerHub CD` du workflow `.github/workflows/ci.yml` gère le déploiement continu.

**Que fait ce workflow ?**
- ✅ Build automatique à chaque push sur `main`
- ✅ Publication sur DockerHub (repository `DOCKERHUB_USERNAME/<nom-du-repo>`)
- ✅ Tags automatiques (latest, branch, sha, semver)
- ✅ Plateforme linux/amd64 avec cache Buildx
- ✅ Ajoute un résumé contenant les liens de documentation dans GitHub Actions

### Activer le workflow

1. **Configurer les secrets DockerHub**
   - Ajoutez `DOCKERHUB_USERNAME` et `DOCKERHUB_TOKEN` (voir [DOCKERHUB_SETUP.md](DOCKERHUB_SETUP.md) pour les détails pas-à-pas).
2. **Pousser votre code**
   ```bash
   git add .
   git commit -m "Configure CI/CD"
   git push origin main
   ```
3. **Vérifier le job `DockerHub CD`**
   - GitHub → Actions → Workflow `CI`
   - Ouvrez le résumé (`Summary`) pour voir l’URL DockerHub et les tags poussés.

### URL de votre image

Après le premier déploiement, votre image sera disponible sur :
```
https://hub.docker.com/r/<votre-username>/<nom-du-repo>
```

Téléchargement direct :
```
docker pull <votre-username>/<nom-du-repo>:latest
```

---

## 📤 Alternative : Publication manuelle ou vers un autre registry

### 1. Publier manuellement sur DockerHub

```bash
docker login
# Username/password ou token DockerHub

docker tag mon-app-recettes:latest VOTRE-USERNAME/mon-app-recettes:latest
docker push VOTRE-USERNAME/mon-app-recettes:latest
```

### 2. Adapter vers GitHub Container Registry (ghcr.io) ou un autre provider

- Remplacez l'étape `DockerHub CD` par une connexion au registry ciblé (`docker login ghcr.io`, `aws ecr get-login`, etc.).
- Changez la variable `IMAGE_NAME` en conséquence (`ghcr.io/<org>/<repo>`).
- Mettez à jour la documentation et les secrets (par exemple `GHCR_TOKEN`).

Ces modifications se font dans `.github/workflows/ci.yml` : vous pouvez copier le job existant, le renommer, et ajuster uniquement la partie authentification/nom d'image.

---

## 🧪 Commandes utiles Docker

```bash
# Lister les images
docker images

# Supprimer une image
docker rmi <IMAGE_ID>

# Lister les conteneurs (tous)
docker ps -a

# Voir les logs d'un conteneur
docker logs <CONTAINER_ID>

# Nettoyer les images inutilisées
docker system prune -a

# Inspecter une image
docker inspect mon-app-recettes:latest

# Exécuter un shell dans le conteneur
docker run -it mon-app-recettes:latest sh
```

---

## ✅ Checklist pour le TD

- [ ] Docker Desktop installé et fonctionnel
- [ ] Image construite localement avec succès
- [ ] Conteneur testé sur http://localhost:8080
- [ ] Code pushé sur GitHub
- [ ] Workflow GitHub Actions exécuté avec succès
- [ ] Image publiée sur DockerHub (ou un autre registry)
- [ ] Package rendu public / repo rendu visible si nécessaire
- [ ] URL de l'image partagée avec le professeur

---

## 🆘 Problèmes courants

### "Cannot connect to Docker daemon"
→ Docker Desktop n'est pas lancé. Démarrez l'application Docker Desktop.

### "denied: permission denied"
→ Vous n'êtes pas connecté au registry. Faites `docker login` ou vérifiez les permissions GitHub.

### "no space left on device"
→ Nettoyez les images inutilisées : `docker system prune -a`

### Le workflow GitHub Actions échoue
→ Vérifiez que le dépôt a les permissions "Read and write permissions" dans Settings → Actions → General → Workflow permissions.

---

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
