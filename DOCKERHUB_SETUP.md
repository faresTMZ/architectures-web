# 🐳 Configuration DockerHub - Guide Complet

Ce guide vous explique comment configurer DockerHub pour publier automatiquement votre image Docker.

---

## 📋 Ce que vous devrez fournir au professeur

À la fin de cette configuration, vous enverrez :

```
Repo : https://github.com/VOTRE-USERNAME/VOTRE-REPO
Image : https://hub.docker.com/r/VOTRE-DOCKERHUB-USERNAME/VOTRE-REPO
```

**Exemple (Groupe sigma) :**
```
Repo : https://github.com/maximelbf/regalade
Image : https://hub.docker.com/repository/docker/mathias2409/regalade/general
```

---

## 🎯 Étape 1 : Créer un compte DockerHub

### 1.1 S'inscrire sur DockerHub

1. Allez sur https://hub.docker.com/signup
2. Créez un compte (gratuit)
3. Vérifiez votre email
4. Notez votre **username DockerHub** (vous en aurez besoin)

**⚠️ Important** : Retenez bien votre **username DockerHub**, pas votre email !

---

## 🔑 Étape 2 : Créer un Access Token

### 2.1 Générer le token

1. Connectez-vous sur https://hub.docker.com
2. Cliquez sur votre avatar (en haut à droite) → **Account Settings**
3. Allez dans **Security** → **Access Tokens**
4. Cliquez sur **Generate New Token**
5. Donnez un nom au token : `github-actions`
6. Permissions : **Read & Write** (ou Read, Write, Delete)
7. Cliquez sur **Generate**
8. **⚠️ COPIEZ LE TOKEN IMMÉDIATEMENT** (vous ne pourrez plus le revoir !)

---

## 🔐 Étape 3 : Configurer les secrets GitHub

### 3.1 Ajouter les secrets dans votre repo GitHub

1. Allez sur votre repo GitHub : `https://github.com/VOTRE-USERNAME/VOTRE-REPO`
2. Cliquez sur **Settings** (en haut)
3. Dans le menu de gauche : **Secrets and variables** → **Actions**
4. Cliquez sur **New repository secret**

### 3.2 Créer le secret DOCKERHUB_USERNAME

- **Name** : `DOCKERHUB_USERNAME`
- **Secret** : Votre username DockerHub (ex: `mathias2409`)
- Cliquez sur **Add secret**

### 3.3 Créer le secret DOCKERHUB_TOKEN

- **Name** : `DOCKERHUB_TOKEN`
- **Secret** : Le token que vous avez copié à l'étape 2
- Cliquez sur **Add secret**

**✅ Vous devez avoir 2 secrets :**
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

---

## 🚀 Étape 4 : Publier votre image

### 4.1 Pousser votre code sur GitHub

```bash
git add .
git commit -m "Configure Docker with DockerHub"
git push origin main
```

### 4.2 Vérifier le workflow GitHub Actions

1. Allez sur votre repo GitHub
2. Cliquez sur l'onglet **Actions**
3. Vous devriez voir le workflow "Build and Push Docker Image" en cours d'exécution
4. Attendez qu'il se termine (⏱️ environ 5-10 minutes)

### 4.3 Vérifier sur DockerHub

1. Allez sur https://hub.docker.com/repositories
2. Vous devriez voir votre image : `VOTRE-USERNAME/VOTRE-REPO`
3. Cliquez dessus pour voir les détails

**🎉 Votre image est maintenant publique sur DockerHub !**

---

## 📤 Étape 5 : Envoyer les liens au professeur

### URL de votre repo GitHub
```
https://github.com/VOTRE-USERNAME/VOTRE-REPO
```

### URL de votre image DockerHub
```
https://hub.docker.com/r/VOTRE-DOCKERHUB-USERNAME/VOTRE-REPO
```

**Format pour le tableur du professeur :**
```
Repo : https://github.com/VOTRE-USERNAME/VOTRE-REPO
Image : https://hub.docker.com/r/VOTRE-DOCKERHUB-USERNAME/VOTRE-REPO
```

---

## 🧪 Étape 6 : Tester localement (optionnel mais recommandé)

### 6.1 Installer Docker Desktop

Voir [DOCKER_SETUP.md](DOCKER_SETUP.md) pour les instructions d'installation.

### 6.2 Build local

```bash
# Construire l'image
docker build -t mon-app-recettes:latest .

# Tester localement
docker run -p 8080:80 mon-app-recettes:latest

# Accéder à http://localhost:8080
```

### 6.3 Publier manuellement (si GitHub Actions ne fonctionne pas)

```bash
# Se connecter à DockerHub
docker login
# Username: votre-dockerhub-username
# Password: votre-dockerhub-password (ou token)

# Taguer l'image
docker tag mon-app-recettes:latest VOTRE-DOCKERHUB-USERNAME/VOTRE-REPO:latest

# Publier
docker push VOTRE-DOCKERHUB-USERNAME/VOTRE-REPO:latest
```

---

## 🔄 Workflow automatique configuré

Le workflow `.github/workflows/ci.yml` (job `DockerHub CD`) est configuré pour :

✅ **Déclencher automatiquement** à chaque push sur `main`
✅ **Builder l'image** pour `linux/amd64`
✅ **Publier sur DockerHub** avec le tag `latest`
✅ **Utiliser le cache** pour accélérer les builds suivants

Vous n'avez **rien à faire manuellement** après la configuration initiale !

---

## ✅ Checklist complète

- [ ] Compte DockerHub créé
- [ ] Access Token DockerHub généré
- [ ] Secret `DOCKERHUB_USERNAME` ajouté sur GitHub
- [ ] Secret `DOCKERHUB_TOKEN` ajouté sur GitHub
- [ ] Code pushé sur GitHub (branche `main`)
- [ ] Workflow GitHub Actions exécuté avec succès
- [ ] Image visible sur DockerHub
- [ ] Image testée localement (optionnel)
- [ ] URLs envoyées au professeur

---

## 🆘 Problèmes courants

### ❌ Erreur : "unauthorized: authentication required"

**Cause** : Les secrets GitHub ne sont pas correctement configurés.

**Solution** :
1. Vérifiez que les secrets `DOCKERHUB_USERNAME` et `DOCKERHUB_TOKEN` existent
2. Vérifiez que le username est exact (pas votre email)
3. Regénérez un nouveau token si nécessaire

### ❌ Workflow GitHub Actions échoue

**Cause** : Permissions insuffisantes ou secrets manquants.

**Solution** :
1. Allez dans Settings → Actions → General
2. Vérifiez que "Workflow permissions" est sur "Read and write permissions"
3. Vérifiez que les secrets sont bien configurés

### ❌ L'image ne s'affiche pas sur DockerHub

**Cause** : Le push a échoué ou le repo n'existe pas.

**Solution** :
1. Vérifiez les logs du workflow GitHub Actions
2. Créez manuellement le repo sur DockerHub si nécessaire
3. Poussez manuellement avec `docker push` pour tester

### ❌ "no space left on device"

**Solution** :
```bash
docker system prune -a
```

---

## 📚 Ressources

- [DockerHub Documentation](https://docs.docker.com/docker-hub/)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Docker Build & Push Action](https://github.com/docker/build-push-action)

---

## 💡 Exemple de liens finaux

Si votre username GitHub est `farestazi` et votre username DockerHub est `farestazi` :

```
Repo : https://github.com/farestazi/architectures-web
Image : https://hub.docker.com/r/farestazi/architectures-web
```

**C'est ce que vous enverrez au professeur !** 🎉
