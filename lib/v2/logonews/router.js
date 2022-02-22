module.exports = function (router) {
    router.get('/work/tags/:tag', require('./index'));
    router.get('/tag/:tag', require('./index'));
    router.get(/([\w|\d|/|-]+)?/, require('./index'));
};
