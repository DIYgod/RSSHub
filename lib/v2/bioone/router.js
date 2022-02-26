module.exports = function (router) {
    router.get('/featured', require('./featured'));
    router.get('/journals/:journal?', require('./journal'));
};
