module.exports = function (router) {
    router.get('/latest/:language?', './latest');
};
