# TaskFlow Windows - Guide d'installation dans Visual Studio / VS Code

Ce projet est une application web React 19 + TypeScript + Vite, conçue selon l'esthétique Windows 11 avec synchronisation Cloud Firebase et gestion de documents de tâches (.taskflow).

---

## 🚀 Étape 1 : Télécharger le projet depuis Google AI Studio

1. Dans l'interface de Google AI Studio (en haut à droite de l'écran), cliquez sur le menu des options **(...)** ou sur le bouton **Export / Download** (ou **Export to GitHub**).
2. Téléchargez l'archive **ZIP** du projet sur votre ordinateur et décompressez-la dans le dossier de votre choix (par exemple `C:\Projets\TaskFlow`).

---

## 💻 Étape 2 : Prérequis sur votre PC Windows

Assurez-vous d'avoir installé :
- **Node.js (version 20 ou supérieure recommandée)** : [Télécharger Node.js](https://nodejs.org/) (choisir la version LTS).
- **Visual Studio Code** (recommandé pour React/Vite) ou **Visual Studio 2022** avec la charge de travail *Développement Node.js*.

---

## 🛠️ Étape 3 : Ouvrir et exécuter le projet

### Option A : Dans Visual Studio Code (Recommandé)
1. Ouvrez **Visual Studio Code**.
2. Allez dans le menu : **Fichier > Ouvrir le dossier...** (ou `Ctrl + K, Ctrl + O`).
3. Sélectionnez le dossier décompressé contenant `package.json`.
4. Ouvrez un terminal dans VS Code : **Terminal > Nouveau terminal** (ou ``Ctrl + ` ``).
5. Installez les dépendances :
   ```bash
   npm install
   ```
6. Lancez le serveur de développement local :
   ```bash
   npm run dev
   ```
7. Cliquez sur le lien affiché (par exemple `http://localhost:3000` ou `http://localhost:5173`) pour ouvrir l'application dans votre navigateur !

---

### Option B : Dans Visual Studio Community (2026 / 2022)

1. **Vérifier la charge de travail Node.js** :
   - Ouvrez **Visual Studio Installer**.
   - Cliquez sur **Modifier** en face de *Visual Studio Community 2026*.
   - Dans l'onglet *Charges de travail*, assurez-vous que **Développement Web et Node.js** (*Node.js development*) est bien cochée.

2. **Ouvrir le projet en 1 clic** :
   - Lancez **Visual Studio Community 2026**.
   - Dans la fenêtre de démarrage, cliquez sur **Ouvrir un dossier local** (*Open a local folder*) et sélectionnez le dossier décompressé de l'application.
   - Visual Studio 2026 détecte automatiquement le projet Vite + React + TypeScript.

3. **Installer et lancer** :
   - Ouvrez le Terminal intégré via **Affichage > Terminal** (<kbd>Ctrl + `</kbd>).
   - Tapez :
     ```bash
     npm install
     npm run dev
     ```
   - Ou faites un clic droit sur `package.json` dans l'Explorateur de solutions > **Restaurer les packages npm**, puis appuyez sur **F5** pour démarrer le débogage.

---

## 📦 Créer un vrai installateur Windows (.exe) avec Mises à Jour Automatiques GitHub

L'architecture **Electron + electron-builder + electron-updater** est déjà pré-configurée dans ce projet !

### 1. Installer les modules Electron (une seule fois sur votre PC)
Dans le terminal de votre projet :
```bash
npm install --save-dev electron electron-builder electron-updater
```

### 2. Tester en mode application de bureau locale
Pour tester l'application directement dans une vraie fenêtre Windows autonome :
```bash
npm run electron:dev
```

### 3. Générer le programme d'installation Windows (.exe)
Pour générer le fichier d'installation officiel (`TaskFlow Windows Setup 1.0.0.exe`) :
```bash
npm run electron:build
```
Le fichier d'installation `.exe` sera créé dans le dossier `release/`.
En double-cliquant dessus, il installe l'application sur Windows, crée un raccourci sur le Bureau et dans le Menu Démarrer.

---

## 🔄 Système de Mise à Jour Automatique via GitHub

Dès que vous publiez une nouvelle version sur GitHub, **les utilisateurs qui ont installé l'application reçoivent automatiquement la mise à jour** sans rien avoir à réinstaller !

### Comment ça fonctionne :
1. Dans `package.json`, modifiez la section `publish` avec votre nom d'utilisateur et dépôt GitHub :
   ```json
   "publish": [
     {
       "provider": "github",
       "owner": "VOTRE_PSEUDO_GITHUB",
       "repo": "taskflow-windows"
     }
   ]
   ```
2. Lorsque vous faites une mise à jour :
   - Changez la version dans `package.json` (ex: `1.0.1`).
   - Créez un tag sur GitHub :
     ```bash
     git tag v1.0.1
     git push origin v1.0.1
     ```
3. Le workflow automatique `.github/workflows/release.yml` déjà inclus dans le projet va compiler le `.exe` sur les serveurs de GitHub et le publier en Release.
4. L'application Windows installée sur votre PC détecte la nouvelle version en arrière-plan et affiche une notification avec un bouton :
   👉 **"Mise à jour prête ! Redémarrer et installer"** !
