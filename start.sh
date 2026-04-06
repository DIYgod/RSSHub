#!/bin/bash

pm2 delete rsshub
pm2 start dist/index.js --name "rsshub"