#!/bin/bash
# Script to remove all role-based authorization checks from route files

# Find all role checks and comment them out
find "backend/Reference_documents/routes" -name "*.js" -type f -exec sed -i.bak '
/if.*req\.user\.role/,/^[[:space:]]*}[[:space:]]*$/{
  s/^/\/\/ /
}
' {} \;

echo "All role checks have been commented out"