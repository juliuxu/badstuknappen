#!/bin/bash

CONTAINER_NAME=super-badstue
COOKIE_JAR=$(mktemp)

[[ -z "${UNRAID_HTTP_USERNAME}" ]] && echo "❌ Environment variable UNRAID_HTTP_USERNAME is missing" && exit 1
[[ -z "${UNRAID_HTTP_PASSWORD}" ]] && echo "❌ Environment variable UNRAID_HTTP_PASSWORD is missing" && exit 1
[[ -z "${UNRAID_USERNAME}" ]] && echo "❌ Environment variable UNRAID_USERNAME is missing" && exit 1
[[ -z "${UNRAID_PASSWORD}" ]] && echo "❌ Environment variable UNRAID_PASSWORD is missing" && exit 1

echo "Login to unraid"
RES=$(curl -i "https://unraid.julianjark.no/login" \
  --user "$UNRAID_HTTP_USERNAME:$UNRAID_HTTP_PASSWORD" \
  --cookie-jar "$COOKIE_JAR" \
  --data-raw "username=$UNRAID_USERNAME&password=$UNRAID_PASSWORD" \
  --output /dev/null \
  --write-out "%{redirect_url}" \
  --silent \
)

if [[ $RES != */Main ]]; then
   echo "❌ Failed to login"
   exit 1
fi


echo "Trigger docker update"
RES=$(curl "https://unraid.julianjark.no/plugins/dynamix.docker.manager/include/CreateDocker.php?updateContainer=true&ct[]=$CONTAINER_NAME" \
  --user "$UNRAID_HTTP_USERNAME:$UNRAID_HTTP_PASSWORD" \
  --cookie "$COOKIE_JAR" \
  --output /dev/null \
  --write-out "%{http_code}" \
  --silent \
)

if [ $RES -ne 200 ]; then
   echo "❌ Failed trigger update"
   exit 1
fi

echo "✅ Done"
