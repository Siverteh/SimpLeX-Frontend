#!/bin/bash

# Define variables
IMAGE_NAME="siverteh/simplex-frontend"
IMAGE_TAG="latest" # Change this as needed
DEPLOYMENT_NAME="simplex-deployment"
NAMESPACE="default" # Change this if your deployment is in a different namespace
CONTAINER_NAME="simplex" # This should match the container name in the deployment

# Step 1: Build the Docker image
echo "Building Docker image $IMAGE_NAME:$IMAGE_TAG..."
docker build -t $IMAGE_NAME:$IMAGE_TAG .

# Check if docker build was successful
if [ $? -ne 0 ]; then
    echo "Docker build failed, exiting..."
    exit 1
fi

# Step 2: Push the Docker image to the registry
echo "Pushing Docker image $IMAGE_NAME:$IMAGE_TAG to registry..."
docker push $IMAGE_NAME:$IMAGE_TAG

# Check if docker push was successful
if [ $? -ne 0 ]; then
    echo "Docker push failed, exiting..."
    exit 1
fi

# Step 3: Update the image in the Kubernetes deployment
echo "Updating Kubernetes deployment $DEPLOYMENT_NAME to use image $IMAGE_NAME:$IMAGE_TAG..."
kubectl set image deployment/$DEPLOYMENT_NAME $CONTAINER_NAME=$IMAGE_NAME:$IMAGE_TAG --namespace=$NAMESPACE

# Check if kubectl set image was successful
if [ $? -ne 0 ]; then
    echo "Kubectl set image failed, exiting..."
    exit 1
fi

# Step 4: Reset the deployment to ensure changes are applied
echo "Restarting Kubernetes deployment $DEPLOYMENT_NAME..."
kubectl rollout restart deployment/$DEPLOYMENT_NAME --namespace=$NAMESPACE

minikube service simplex-service --url
