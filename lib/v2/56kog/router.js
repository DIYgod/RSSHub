module.exports = (router) => {
    router.get('/class/:category?', require('./class'));
    router.get('/top/:category?', require('./top'));
};
