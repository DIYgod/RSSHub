const express = require('express');
const logger = require('./utils/logger');

logger.info('🍻 RSSHub start! Cheers!');

const app = express();
app.engine('art', require('express-art-template'));

app.all('*', require('./routes/all'));

app.listen(1200);