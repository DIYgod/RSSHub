module.exports = function (router) {
    router.get('/dh/:language?', require('./dh'));
    router.get('/chp/:category?/:language?', require('./chp'));
};
