#!/bin/bash

# Try running the docker and get the output
# then try getting homepage in 3 mins

docker run -d -p 1200:1200 rsshub

if [[ $? -ne 0 ]]
    echo "failed to run docker"
    exit 1
fi

RETRY=0
curl -m 10 localhost:1200
while [[ $? -ne 0 ]] && [[ $RETRY -lt 60 ]]; do
    sleep 5
    ((RETRY++))
    curl -m 10 localhost:1200
done

if [[ $RETRY -gt 60 ]]
then
    echo "Unable to run, aborted"
    exit 1
else
    echo "Successfully acquire homepage, passing"
    exit 0
fi