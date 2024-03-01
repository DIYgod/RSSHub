module.exports = function (router) {
    router.get('/newsflash', require('./newsflash'));
    router.get('/:do?/:keyword?', require('./index'));
};
