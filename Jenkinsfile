pipeline {
    agent any

    tools {
        jfrog 'jfrog-cli'
    }

    environment {
        BUILD_NAME = "${JOB_NAME}"
        BUILD_NUMBER = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
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
                jf 'npmc --repo-resolve demo-npm-virtual --repo-deploy demo-npm-local'
            }
        }

        stage('Build & Deploy') {
            steps {
                echo '--- Installing dependencies and deploying artifacts to JFrog ---'
                jf "npm install --build-name=${BUILD_NAME} --build-number=${BUILD_NUMBER}"
                sh 'npm test'
                sh 'npm run build'
                echo '--- Publishing package to Artifactory ---'
                jf "npm publish --build-name=${BUILD_NAME} --build-number=${BUILD_NUMBER}"
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
