#!/bin/bash

echo "Setting up Docker for AlgoRush code execution..."

echo "Pulling Docker images..."
docker pull gcc:11.2

echo "Testing Docker execution..."
CONTAINER_NAME="algorush-test-container"

docker run --name $CONTAINER_NAME -d gcc:11.2 sleep 5

if [ $(docker ps -q -f name=$CONTAINER_NAME) ]; then
    echo "Docker setup successful!"
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
else
    echo "Failed to run Docker container. Please check your Docker installation."
    exit 1
fi

echo "Docker setup complete!"
