#!/bin/bash

MAX_RETRIES=60
# Try running the docker and get the output
# then try getting homepage in 3 mins

docker run -d -p 1200:1200 rsshub:latest

if [[ $? -ne 0 ]]
then
    echo "failed to run docker"
    exit 1
fi

RETRY=1
curl -m 10 localhost:1200
while [[ $? -ne 0 ]] && [[ $RETRY -lt $MAX_RETRIES ]]; do
    sleep 5
    ((RETRY++))
    echo "RETRY: ${RETRY}"
    curl -m 10 localhost:1200
done

if [[ $RETRY -gt $MAX_RETRIES ]]
then
    echo "Unable to run, aborted"
    exit 1
else
    echo "Successfully acquire homepage, passing"
    exit 0
fi