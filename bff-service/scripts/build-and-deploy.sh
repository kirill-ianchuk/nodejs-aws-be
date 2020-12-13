#!/usr/bin/env bash

# This script is for building bff-service and deploying it using AWS Beanstalk

set -o nounset
set -o errexit
set -o xtrace

# Build the service
source ./scripts/build.sh

# Deploy the service
eb deploy
