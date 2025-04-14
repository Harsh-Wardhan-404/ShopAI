#!/bin/bash

# Clean the .next directory 
echo "Cleaning Next.js build cache..."
rm -rf .next

# Run a test build to catch all errors
echo "Running Next.js build check..."
npm run build

# If build check passed, build Docker image
if [ $? -eq 0 ]; then
  echo "Build check passed, building Docker image..."
  docker build -t shopai .
else
  echo "Build check failed. Fix errors before building Docker image."
  exit 1
fi