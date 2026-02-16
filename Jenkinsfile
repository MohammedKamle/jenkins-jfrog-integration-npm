pipeline {
    agent any

    tools {
        jfrog 'jfrog-cli'
    }

    environment {
        BUILD_NAME = "${JOB_NAME}"
        BUILD_NUMBER = "${BUILD_NUMBER}"
        NODEJS_HOME = "${WORKSPACE}/tools/node"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Node.js') {
            steps {
                echo '--- Installing Node.js ---'
                sh '''
                    ARCH=$(uname -m)
                    case "$ARCH" in
                        x86_64)        NODE_ARCH="x64" ;;
                        aarch64|arm64) NODE_ARCH="arm64" ;;
                        *)             echo "Unsupported arch: $ARCH"; exit 1 ;;
                    esac
                    NODE_DIR="node-v20.18.1-linux-${NODE_ARCH}"
                    if [ ! -f "tools/${NODE_DIR}/bin/node" ]; then
                        mkdir -p tools
                        curl -fsSL "https://nodejs.org/dist/v20.18.1/${NODE_DIR}.tar.gz" | tar -xz -C tools
                    fi
                    ln -sfn "${NODE_DIR}" tools/node
                    echo "Node.js installed: $(tools/node/bin/node --version)"
                    echo "npm installed: $(tools/node/bin/node tools/node/bin/npm --version)"
                '''
            }
        }

        stage('Verify JFrog Connection') {
            steps {
                echo '--- Verifying JFrog CLI configuration ---'
                jf 'c show'
                jf 'rt ping'
            }
        }

        stage('Configure npm Repos') {
            steps {
                echo '--- Configuring npm resolution and deployment repositories ---'
                jf 'npmc --repo-resolve demo-npm --repo-deploy demo-npm-local'
            }
        }

        stage('Build & Deploy') {
            steps {
                withEnv(["PATH+NODEJS=${NODEJS_HOME}/bin"]) {
                    echo '--- Installing dependencies and deploying artifacts to JFrog ---'
                    jf "npm install --build-name=${BUILD_NAME} --build-number=${BUILD_NUMBER}"
                    sh 'npm test'
                    sh 'npm run build'
                    echo '--- Bumping version to 1.0.${BUILD_NUMBER} ---'
                    sh "npm version 1.0.${BUILD_NUMBER} --no-git-tag-version --allow-same-version"
                    echo '--- Publishing package to Artifactory ---'
                    jf "npm publish --build-name=${BUILD_NAME} --build-number=${BUILD_NUMBER}"
                }
            }
        }

        stage('Publish Build Info') {
            steps {
                echo '--- Publishing build info to JFrog Artifactory ---'
                jf "rt bp ${BUILD_NAME} ${BUILD_NUMBER}"
            }
        }
    }

    post {
        success {
            echo "Build ${BUILD_NAME}#${BUILD_NUMBER} completed successfully and published to JFrog!"
        }
        failure {
            echo "Build ${BUILD_NAME}#${BUILD_NUMBER} failed."
        }
    }
}
