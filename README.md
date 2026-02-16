# Demo NPM App - Jenkins Pipeline with JFrog

A simple Node.js npm project demonstrating how to build and publish artifacts to JFrog Artifactory using the JFrog CLI in a Jenkins pipeline.

## Project Overview

This project contains:

- A minimal Node.js application using lodash
- A `Jenkinsfile` that builds the project via `jf npm install` / `jf npm publish`, deploys artifacts to JFrog, and publishes build info
- All npm dependencies are resolved through JFrog (virtual repo proxying the npm registry)

## Prerequisites

- **Jenkins** running (e.g., as a Docker container on localhost)
- **JFrog Jenkins Plugin** installed and configured with a working server connection
- **JFrog CLI** configured as a Jenkins Global Tool named `jfrog-cli`
- **Node.js and npm** available on the build agent (on PATH), or the Node.js plugin installed and configured (see below)
- A **Git** repository to host this project

Your JFrog connection should already be verified — running `jf c show` and `jf rt ping` in a Jenkins pipeline should succeed.

---

## Setup Steps

### 1. Create JFrog Repositories

You need three npm repositories in JFrog Artifactory. Create them via the JFrog UI:

**Navigate to:** JFrog UI > Administration > Repositories

#### a) Local Repository — `demo-npm-local`

1. Click **Add Repository** > **Local Repository**
2. Select package type: **npm**
3. Set Repository Key: `demo-npm-local`
4. Click **Create Local Repository**

This is where your published npm package (tarball) will be deployed.

#### b) Remote Repository — `demo-npm-remote`

1. Click **Add Repository** > **Remote Repository**
2. Select package type: **npm**
3. Set Repository Key: `demo-npm-remote`
4. Set URL: `https://registry.npmjs.org`
5. Click **Create Remote Repository**

This proxies the npm registry — dependencies like lodash are fetched through here and cached in JFrog.

#### c) Virtual Repository — `demo-npm-virtual`

1. Click **Add Repository** > **Virtual Repository**
2. Select package type: **npm**
3. Set Repository Key: `demo-npm-virtual`
4. Under **Repositories**, add both:
   - `demo-npm-local`
   - `demo-npm-remote`
5. Set **Default Deployment Repository**: `demo-npm-local`
6. Click **Create Virtual Repository**

This is the single entry point for both resolving dependencies and deploying artifacts.

**Optional — create via CLI (if you have admin access):**

```bash
jf repo create demo-npm-local --package-type npm --rclass local
jf repo create demo-npm-remote --package-type npm --rclass remote --url https://registry.npmjs.org
jf repo create demo-npm-virtual --package-type npm --rclass virtual --repositories demo-npm-remote demo-npm-local
```

### 2. Ensure Node.js and npm on the build agent

The pipeline runs `npm install`, `npm test`, and `npm publish` via `sh` steps, so the Jenkins agent must have Node.js (v18+) and npm on its PATH.

- **Option A:** Install Node.js (and npm) on the agent(s) that will run this job (e.g. system packages, nvm, or a Docker image with Node).
- **Option B:** Install the [Node.js Plugin](https://plugins.jenkins.io/nodejs/) in Jenkins, add a Node.js installation (e.g. name `NodeJS-20`), then add `nodejs 'NodeJS-20'` inside the `tools { }` block in the Jenkinsfile next to `jfrog 'jfrog-cli'`.

### 3. Push Code to Git

Push this project to a Git repository:

```bash
cd jenkins-pipeline-npm
git init
git add .
git commit -m "Initial commit: demo npm app with Jenkins pipeline for JFrog"
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

### 5. Create a Multibranch Pipeline in Jenkins

1. Go to **Jenkins Dashboard** > **New Item**
2. Enter a name (e.g., `demo-npm-pipeline`)
3. Select **Multibranch Pipeline** > click **OK**
4. Under **Branch Sources**:
   - Click **Add source** > **Git** (or **GitHub**)
   - Enter your repository URL
   - Add credentials if the repo is private
5. Under **Build Configuration**:
   - Mode: **by Jenkinsfile**
   - Script Path: `Jenkinsfile`
6. Click **Save**

Jenkins will scan the repository and automatically discover branches and pull requests.

### 6. Configure Triggers

**Option A: Poll SCM (simplest)**

1. In the Multibranch Pipeline configuration, under **Scan Multibranch Pipeline Triggers**
2. Check **Periodically if not otherwise run**
3. Set interval (e.g., `2 minutes`)
4. Click **Save**

**Option B: GitHub Webhook (e.g. via ngrok)**

Configure a webhook so Jenkins runs on push. Payload URL: `https://<your-jenkins-host>/github-webhook/`

---

## Pipeline Stages

The Jenkinsfile defines these stages:

| Stage | What it does |
|-------|-------------|
| **Checkout** | Checks out the source code from the Git repository |
| **Verify JFrog Connection** | Runs `jf c show` and `jf rt ping` to verify connectivity |
| **Configure npm Repos** | Runs `jf npmc` to set resolver repo (`demo-npm-virtual`) and deployer repo (`demo-npm-local`) |
| **Build & Deploy** | Runs `jf npm install` (resolve deps from JFrog), `npm test`, `npm run build`, then `jf npm publish` to deploy the package to Artifactory |
| **Publish Build Info** | Runs `jf rt bp` — publishes build metadata to Artifactory for traceability |

## Dependencies

All dependencies are resolved through JFrog's `demo-npm-virtual` repository (which proxies the npm registry):

| Dependency | Purpose |
|------------|---------|
| lodash | String/array utilities (`join`, `capitalize`, `map`) |

## Verifying the Build

After a successful pipeline run, you can verify:

1. **Artifacts in JFrog**: Navigate to `demo-npm-local` in the JFrog UI — you should see the `demo-app` package (e.g. `demo-app-1.0.0.tgz`) and metadata.

2. **Cached Dependencies**: Navigate to the remote cache (e.g. under `demo-npm-remote`) — you should see cached copies of lodash and other dependencies.

3. **Build Info**: Go to **Builds** in the JFrog UI — you should see the build with its dependencies, artifacts, and environment details.
# jenkins-jfrog-integration-npm
