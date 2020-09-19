#!/bin/sh

ROOT_DIR=/app

# Replace env vars in files served by NGINX
echo "Replacing environment variables"
for file in $ROOT_DIR/js/*.js* $ROOT_DIR/index.html $ROOT_DIR/precache-manifest*.js;
do
  echo "Processing $file ...";

  # Authentication
  sed -i 's|VUE_APP_AUTHENTICATION_URL_PLACEHOLDER|'${VUE_APP_AUTHENTICATION_API_URL}'|g' $file
  sed -i 's|VUE_APP_AUTHENTICATION_API_URL_PLACEHOLDER|'${VUE_APP_AUTHENTICATION_API_URL}'|g' $file
  sed -i 's|VUE_APP_AUTHENTICATION_MANAGER_URL_PLACEHOLDER|'${VUE_APP_AUTHENTICATION_API_URL}'|g' $file
  sed -i 's|VUE_APP_AUTHENTICATION_MANAGER_API_URL_PLACEHOLDER|'${VUE_APP_AUTHENTICATION_API_URL}'|g' $file

  # Misc
  sed -i 's|VUE_APP_COOKIE_DOMAIN_PLACEHOLDER|'${VUE_APP_COOKIE_DOMAIN}'|g' $file

  # Group manager
  sed -i 's|VUE_APP_GROUP_MANAGER_API_URL_PLACEHOLDER|'${VUE_APP_GROUP_MANAGER_API_URL}'|g' $file

  # User profile
  sed -i 's|VUE_APP_USER_MANAGER_FRONT_URL_PLACEHOLDER|'${VUE_APP_USER_MANAGER_FRONT_URL}'|g' $file
  sed -i 's|VUE_APP_USER_PROFILE_ROUTE_PLACEHOLDER|'${VUE_APP_USER_PROFILE_ROUTE}'|g' $file


done

echo "Starting Nginx"
nginx -g 'daemon off;'
