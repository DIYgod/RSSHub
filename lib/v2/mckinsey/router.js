module.exports = (router) => {
    router.get('/cn/:category?', require('./cn/index'));
};
