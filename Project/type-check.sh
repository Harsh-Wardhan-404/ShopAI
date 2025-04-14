#!/bin/sh

# Clean Next.js cache first
echo "Cleaning Next.js cache..."
rm -rf .next

# Run Next.js type checking
echo "Running Next.js type check..."
npx tsc --noEmit

# If type check passes, run a sample build to check route and dynamic errors
if [ $? -eq 0 ]; then
  echo "TypeScript type check passed, running build check..."
  npx next build
else
  echo "TypeScript type check failed. Fix errors before continuing."
  exit 1
fi

# If all checks pass, report success
if [ $? -eq 0 ]; then
  echo "All checks passed! Docker build should succeed."
else
  echo "Build check failed. Fix errors before building Docker image."
  exit 1
fi