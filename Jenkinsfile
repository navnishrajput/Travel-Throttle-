pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                echo '? Code checked out from GitHub'
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

        stage('Deploy') {
            steps {
                sh 'docker stop travel-container || true'
                sh 'docker rm travel-container || true'
                sh 'docker run -d --name travel-container -p 8080:8080 travel-throttle-api'
            }
        }

        stage('Verify') {
            steps {
                sh 'sleep 20 && curl -f http://localhost:8080/'
            }
        }
    }

    post {
        success {
            echo '?? Pipeline completed!'
        }
        failure {
            echo '? Pipeline failed!'
        }
    }
}
