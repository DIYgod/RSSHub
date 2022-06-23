module.exports = function (router) {
    router.get('/newsflash', require('./newsflash'));
    router.get('/:category?', require('./index'));
};
