#!/bin/bash

docker build -t siverteh/simplex-frontend:ole .
docker push siverteh/simplex-frontend:ole
kubectl delete pods --all
sleep 5
minikube service simplex-frontend-service