module.exports = function (router) {
    router.get('/bt/:subforumid?', require('./index'));
    router.get('/picture/:subforumid', require('./index'));
    router.get('/:subforumid?/:type?', require('./index'));
    router.get('/:subforumid?', require('./index'));
    router.get('', require('./index'));
};
