#!/bin/bash

pnpm build
docker build -t rsshub:local .
docker compose  up -d