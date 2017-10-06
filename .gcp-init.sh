#!/bin/bash

# build the image
docker build --no-cache -f Dockerfile-prod -t twitch-ext-top-eight:v0 .

docker tag twitch-ext-top-eight:v0 us.gcr.io/twitch-extensions/twitch-ext-top-eight:v0

gcloud docker -- push us.gcr.io/twitch-extensions/twitch-ext-top-eight:v0

# connect to the cluster
gcloud container clusters get-credentials top-8-ext \
  --zone us-central1-a --project twitch-extensions

# cleanup old service
kubectl delete service top-8-ext

kubectl run top-8-ext --image=us.gcr.io/twitch-extensions/twitch-ext-top-eight:v0 --port 8000
kubectl apply -f ingress.yml

kubectl proxy --port=9061
