pipeline {
    agent any

    environment {
        /* ---------- SONAR ---------- */
        SONAR_TOKEN = credentials('sonar')

        /* ---------- AWS ---------- */
        AWS_REGION = 'us-east-1'

        /* ---------- ECR PUBLIC ---------- */
        ECR_PUBLIC_REGISTRY = 'public.ecr.aws/p3h2q3u4'

        BACKEND_IMAGE  = 'moviez/backend'
        FRONTEND_IMAGE = 'moviez/frontend'
        IMAGE_TAG      = 'latest'
    }

    stages {

        /* ================= CHECKOUT ================= */

        stage('Clean & Checkout') {
            steps {
                deleteDir()
                git branch: 'master',
                    url: 'https://github.com/sacheen77/moviez.git'
            }
        }

        /* ================= BACKEND ================= */

       /* stage('Backend - Test & Sonar') {
            steps {
                dir('backend') {
                    sh '''
                        npm ci
                        npm test -- --coverage
                    '''
                    script {
                        def scannerHome = tool name: 'sonar-scanner',
                            type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                        sh """
                          ${scannerHome}/bin/sonar-scanner \
                          -Dsonar.login=${SONAR_TOKEN}
                        """
                    }
                }
            }
        }

        // ================= FRONTEND ================= 

        stage('Frontend - Test & Sonar') {
            steps {
                dir('frontend') {
                    sh '''
                        npm ci
                        npx vitest run --coverage
                    '''
                    script {
                        def scannerHome = tool name: 'sonar-scanner',
                            type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                        sh """
                          ${scannerHome}/bin/sonar-scanner \
                          -Dsonar.login=${SONAR_TOKEN}
                        """
                    }
                }
            }
        } 

        /* ================= DOCKER BUILD ================= */

        stage('Docker Build (Frontend & Backend)') {
            steps {
                sh '''
                  docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} backend
                  docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} frontend
                '''
            }
        }

        /* // ================= TRIVY SCAN ================= 

        stage('Trivy Scan (CRITICAL only)') {
            steps {
                sh '''
                  trivy image --severity CRITICAL --exit-code 1 ${BACKEND_IMAGE}:${IMAGE_TAG}
                  trivy image --severity CRITICAL --exit-code 1 ${FRONTEND_IMAGE}:${IMAGE_TAG}
                '''
            }
        } */

        /* ================= AWS LOGIN (PUBLIC ECR) ================= */

        stage('AWS Login (ECR Public)') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                      aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
                      aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
                      aws configure set default.region $AWS_REGION

                      aws sts get-caller-identity

                      aws ecr-public get-login-password --region $AWS_REGION \
                      | docker login --username AWS --password-stdin public.ecr.aws
                    '''
                }
            }
        }

        /* ================= PUSH TO ECR PUBLIC ================= */

        stage('Tag & Push Images (Public ECR)') {
            steps {
                sh '''
                  docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} \
                    ${ECR_PUBLIC_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}

                  docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                    ${ECR_PUBLIC_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}

                  docker push ${ECR_PUBLIC_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}
                  docker push ${ECR_PUBLIC_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                '''
            }
        }

        /* ================= CLEANUP ================= */

        stage('Docker Cleanup (Jenkins Node)') {
            steps {
                sh '''
                  docker image prune -af
                  docker builder prune -af
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
