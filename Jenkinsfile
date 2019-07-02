pipeline {
    agent { docker { image 'node' } }
    stages {
        stage('build') {
            steps {
                bash 'npm --version'
            }
        }
    }
}
