module.exports = (router) => {
    router.get('/article/:categoryId/:sortType?/:timeRange?', require('./article'));
    router.get('/bangumi/:id', require('./bangumi'));
    router.get('/user/video/:uid', require('./video'));
};
