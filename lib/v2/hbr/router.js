module.exports = function (router) {
    router.get('/topic/:topic?/:type?', require('./topic'));
};
