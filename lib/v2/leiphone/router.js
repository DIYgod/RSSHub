module.exports = function (router) {
    router.get('/:do?/:keyword?', require('./index'));
    router.get('/newsflash', require('./newsflash'));
};
