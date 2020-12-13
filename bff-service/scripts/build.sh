#!/usr/bin/env bash

# This script is for building bff-service for further deployment

set -o nounset
set -o errexit
set -o xtrace

# Build the service
npm run build

# Copy files needed for deployment
cp ./package.json ./dist/package.json
cp ./package-lock.json ./dist/package-lock.json
cp ./Procfile ./dist/Procfile
cp ./.env ./dist/.env

# Create zip archive for deployment
cd dist
zip -r ./app.zip .
cd ..
