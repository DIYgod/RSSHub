module.exports = (router) => {
    router.get('/hub/comments', require('./comments'));
    router.get('/hub/events', require('./events'));
    router.get('/hub/:tagId/:sort?/:range?', require('./hub'));
    router.get('/hub/:tagId/:sort?', require('./hub'));
    router.get('/hub/:sort?', require('./hub'));
};
