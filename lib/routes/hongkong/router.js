module.exports = function (router) {
    router.get('/dh/:language?', './dh');
    router.get('/chp/:category?/:language?', './chp');
};
