pipeline {
    agent any

    environment {
        /* ---------- SONAR ---------- */
        SONAR_TOKEN = credentials('sonar')

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
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend - Test & Sonar') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm test -- --coverage'
                    // script {
                    //     def scannerHome = tool 'sonar-scanner'
                    //     sh "${scannerHome}/bin/sonar-scanner -Dsonar.login=${SONAR_TOKEN}"
                    // }
                }
            }
        }

        stage('Frontend - Test & Sonar') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npx vitest run --coverage'
                    // script {
                    //     def scannerHome = tool 'sonar-scanner'
                    //     sh "${scannerHome}/bin/sonar-scanner -Dsonar.login=${SONAR_TOKEN}"
                    // }
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                  docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} backend
                  docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} frontend
                '''
            }
        }

        stage('Trivy Scan (CRITICAL only)') {
            steps {
                sh '''
                  trivy image --severity CRITICAL --exit-code 1 ${BACKEND_IMAGE}:${IMAGE_TAG}
                  trivy image --severity CRITICAL --exit-code 1 ${FRONTEND_IMAGE}:${IMAGE_TAG}
                '''
            }
        }

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

        // stage('Deploy to Kubernetes') {
        //     steps {
        //         withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
        //             sh '''
        //               kubectl apply -f k8s/namespace.yaml
        //               kubectl apply -n ${K8S_NAMESPACE} -f k8s/deployment.yaml
        //               kubectl apply -n ${K8S_NAMESPACE} -f k8s/service.yaml
        //               kubectl apply -n ${K8S_NAMESPACE} -f k8s/ingress.yaml

        //               kubectl rollout status deployment/moviez-app -n ${K8S_NAMESPACE}
        //             '''
        //         }
        //     }
        // }

        stage('Deploy with Helm') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                     helm upgrade --install moviez-prod ./Helm/moviez \
                     -n moviez \
                     --create-namespace \
                     -f Helm/moviez/values-prod.yaml

                    '''
                }
            }
        }

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
