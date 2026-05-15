pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                echo '✅ Code pulled from GitHub'
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend/travel-throttle-api') {
                    sh 'chmod +x mvnw'
                    sh './mvnw clean package -DskipTests'
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                dir('backend/travel-throttle-api') {
                    sh 'sudo docker build -t travel-throttle-api .'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                sh '''
                    sudo docker stop travel-container || true
                    sudo docker rm travel-container || true
                    sudo docker run -d --name travel-container -p 8080:8080 --restart unless-stopped travel-throttle-api
                '''
            }
        }
        
        stage('Verify') {
            steps {
                sh 'sleep 30 && curl -f http://localhost:8080/'
            }
        }
    }
    
    post {
        success {
            echo '🎉 Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
