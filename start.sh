#!/bin/bash

pm2 delete rsshub
pm2 start 'pnpm run start' --name "rsshub"
