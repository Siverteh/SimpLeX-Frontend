#!/bin/bash

docker build -t siverteh/simplex-frontend:ole .
docker push siverteh/simplex-frontend:ole
kubectl delete pods -l app=simplex-frontend --wait=false
sleep 5
minikube service simplex-frontend-service