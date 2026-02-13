pipeline {
    agent any

    environment {
        /* ---------- SONAR ---------- */
        SONAR_TOKEN = credentials('sonar')
        SONAR_PROJECT_KEY = 'your-org_moviez'
        SONAR_ORG = 'your-org'

        /* ---------- AWS ---------- */
        AWS_REGION = 'us-east-1'

        /* ---------- ECR ---------- */
        ECR_PUBLIC_REGISTRY = 'public.ecr.aws/p3h2q3u4'
        BACKEND_IMAGE  = 'moviez/backend'
        FRONTEND_IMAGE = 'moviez/frontend'
        IMAGE_TAG      = "latest"

        /* ---------- K8S ---------- */
        K8S_NAMESPACE = 'moviez'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        /* ========================================================= */
        /* ================= BACKEND SECTION ======================= */
        /* ========================================================= */

        stage('Backend - Install & Test') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm test -- --coverage'
                }
            }
        }

        /* ========================================================= */
        /* ================= FRONTEND SECTION ====================== */
        /* ========================================================= */

        stage('Frontend - Install & Test') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npx vitest run --coverage'
                }
            }
        }

        /* ========================================================= */
        /* ================= SONAR ANALYSIS ======================== */
        /* ========================================================= */

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube-Cloud') {
                    script {
                        def scannerHome = tool 'sonar-scanner'
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                          -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                          -Dsonar.organization=${SONAR_ORG} \
                          -Dsonar.sources=. \
                          -Dsonar.token=${SONAR_TOKEN} \
                          -Dsonar.javascript.lcov.reportPaths=backend/coverage/lcov.info,frontend/coverage/lcov.info \
                          -Dsonar.qualitygate.wait=false
                        """
                    }
                }
            }
        }

        /* ========================================================= */
        /* ================= QUALITY GATE ========================== */
        /* ========================================================= */

        stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        /* ========================================================= */
        /* ================= DOCKER BUILD ========================== */
        /* ========================================================= */

        stage('Docker Build') {
            steps {
                sh '''
                  docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} backend
                  docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} frontend
                '''
            }
        }

        /* ========================================================= */
        /* ================= TRIVY SCAN ============================ */
        /* ========================================================= */

        stage('Trivy Scan (CRITICAL only)') {
            steps {
                sh '''
                  trivy image --severity CRITICAL --exit-code 1 ${BACKEND_IMAGE}:${IMAGE_TAG}
                  trivy image --severity CRITICAL --exit-code 1 ${FRONTEND_IMAGE}:${IMAGE_TAG}
                '''
            }
        }

        /* ========================================================= */
        /* ================= AWS LOGIN ============================= */
        /* ========================================================= */

        stage('AWS Login (ECR Public)') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-access-key', variable: 'AWS_ACCESS_KEY_ID'),
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY')
                ]) {
                    sh '''
                      aws ecr-public get-login-password --region ${AWS_REGION} \
                      | docker login --username AWS --password-stdin public.ecr.aws
                    '''
                }
            }
        }

        /* ========================================================= */
        /* ================= PUSH IMAGES =========================== */
        /* ========================================================= */

        stage('Push Images') {
            steps {
                sh '''
                  docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${ECR_PUBLIC_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}
                  docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${ECR_PUBLIC_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}

                  docker push ${ECR_PUBLIC_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}
                  docker push ${ECR_PUBLIC_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}
                '''
            }
        }

        /* ========================================================= */
        /* ================= HELM DEPLOY =========================== */
        /* ========================================================= */

        stage('Deploy with Helm') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                      helm upgrade --install moviez-prod ./Helm/moviez \
                        -n ${K8S_NAMESPACE} \
                        --create-namespace \
                        -f Helm/moviez/values-prod.yaml

                      kubectl rollout status deployment/moviez-backend -n ${K8S_NAMESPACE}
                      kubectl rollout status deployment/moviez-frontend -n ${K8S_NAMESPACE}
                    '''
                }
            }
        }

        /* ========================================================= */
        /* ================= CLEANUP =============================== */
        /* ========================================================= */

        stage('Cleanup') {
            steps {
                sh '''
                  docker image prune -af
                  docker builder prune -af
                '''
            }
        }
    }

    post {
        success {
            echo "Deployment successful. Application is live."
        }
        failure {
            echo "Pipeline failed. Review logs."
        }
        always {
            cleanWs()
        }
    }
}
