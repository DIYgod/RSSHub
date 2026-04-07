#!/bin/bash

pm2 delete rsshub
pm2 start dist/index.mjs --name "rsshub"
