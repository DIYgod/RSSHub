module.exports = function (router) {
    router.get('/chp/:category?/:language?', require('./chp'));
};
