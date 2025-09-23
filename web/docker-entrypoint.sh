#!/bin/sh

# Replace environment variables in built files
if [ "$VITE_API_URL" ]; then
    find /usr/share/nginx/html -name "*.js" -exec sed -i "s|http://localhost:3000/api|$VITE_API_URL|g" {} \;
fi

# Start nginx
exec "$@"