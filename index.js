const express = require('express');
const logger = require('./utils/logger');

logger.info('🍻 RSSHub start! Cheers!');

const app = express();

app.all('*', require('./routes/all'));

// bilibili
app.get('/bilibili/user/video/:uid', require('./routes/bilibili/video'));
app.get('/bilibili/user/fav/:uid', require('./routes/bilibili/fav'));
app.get('/bilibili/user/coin/:uid', require('./routes/bilibili/coin'));
app.get('/bilibili/user/dynamic/:uid', require('./routes/bilibili/dynamic'));
app.get('/bilibili/partion/:tid', require('./routes/bilibili/partion'));
app.get('/bilibili/bangumi/:seasonid', require('./routes/bilibili/bangumi'));

// 微博
app.get('/weibo/user/:uid', require('./routes/weibo/user'));

// 网易云音乐
app.get('/ncm/playlist/:id', require('./routes/ncm/playlist'));

// 掘金
app.get('/juejin/category/:category', require('./routes/juejin/category'));

// 自如
app.get('/ziroom/room/:city/:iswhole/:room/:keyword', require('./routes/ziroom/room'));

// 快递
app.get('/express/:company/:number', require('./routes/express/express'));

// 简书
app.get('/jianshu/home', require('./routes/jianshu/home'));
app.get('/jianshu/trending/weekly', require('./routes/jianshu/weekly'));
app.get('/jianshu/trending/monthly', require('./routes/jianshu/monthly'));
app.get('/jianshu/collection/:id', require('./routes/jianshu/collection'));
app.get('/jianshu/user/:id', require('./routes/jianshu/user'));

app.listen(1200);