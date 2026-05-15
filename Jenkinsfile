stage('Deploy') {
    steps {
        sh '''
            sudo docker stop travel-container || true
            sudo docker rm travel-container || true
            sudo docker run -d --name travel-container --network host --restart unless-stopped travel-throttle-api
        '''
    }
}
