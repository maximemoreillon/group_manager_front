#!/bin/sh
ROOT_DIR=/app
# Replace env vars in files served by NGINX
echo "Replacing environment variables"

for file in $ROOT_DIR/js/*.js* $ROOT_DIR/index.html $ROOT_DIR/precache-manifest*.js;
do
  echo "Processing $file ...";

  sed -i 's|VUE_APP_LOGIN_URL_PLACEHOLDER|'${VUE_APP_LOGIN_URL}'|g' $file
  sed -i 's|VUE_APP_IDENTIFICATION_URL_PLACEHOLDER|'${VUE_APP_IDENTIFICATION_URL}'|g' $file
  sed -i 's|VUE_APP_GROUP_MANAGER_API_URL_PLACEHOLDER|'${VUE_APP_GROUP_MANAGER_API_URL}'|g' $file
  sed -i 's|VUE_APP_USER_MANAGER_FRONT_URL_PLACEHOLDER|'${VUE_APP_USER_MANAGER_FRONT_URL}'|g' $file
  sed -i 's|VUE_APP_PUBLIC_PATH_PLACEHOLDER|'${VUE_APP_PUBLIC_PATH}'|g' $file

  sed -i 's|VUE_APP_LOGIN_HINT_PLACEHOLDER|'${VUE_APP_LOGIN_HINT}'|g' $file
  sed -i 's|VUE_APP_HOMEPAGE_URL_PLACEHOLDER|'${VUE_APP_HOMEPAGE_URL}'|g' $file

  sed -i 's|VUE_APP_OIDC_AUTHORITY_PLACEHOLDER|'${VUE_APP_OIDC_AUTHORITY}'|g' $file
  sed -i 's|VUE_APP_OIDC_CLIENT_ID_PLACEHOLDER|'${VUE_APP_OIDC_CLIENT_ID}'|g' $file
  sed -i 's|VUE_APP_OIDC_AUDIENCE_PLACEHOLDER|'${VUE_APP_OIDC_AUDIENCE}'|g' $file



done

exec "$@"
