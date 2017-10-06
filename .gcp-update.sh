#!/bin/bash

VERSION_NUMBER=$(date +%s)

# build the image 
docker build --no-cache -f Dockerfile-prod -t twitch-ext-top-eight:${VERSION_NUMBER} .

docker tag twitch-ext-top-eight:${VERSION_NUMBER} us.gcr.io/twitch-extensions/twitch-ext-top-eight:${VERSION_NUMBER}

gcloud docker -- push us.gcr.io/twitch-extensions/twitch-ext-top-eight:${VERSION_NUMBER}

# connect to the cluster
gcloud container clusters get-credentials top-8-ext \
  --zone us-central1-a --project twitch-extensions

# apply a rolling update to the existing deployment with an image update
kubectl set image deployment/top-8-ext top-8-ext=us.gcr.io/twitch-extensions/twitch-ext-top-eight:${VERSION_NUMBER}

kubectl proxy --port=9061
