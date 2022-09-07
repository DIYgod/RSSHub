module.exports = function (router) {
    router.get('/express', require('./express'));
    router.get('/newsflash', require('./express'));
    router.get('/', require('./index'));
};
