// This file is served as an entry for AWS Lmabda
const serverless = require('aws-serverless-koa');

exports.handler = serverless(require('./app.js'));
