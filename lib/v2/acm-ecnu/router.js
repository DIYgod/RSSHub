module.exports = function (router) {
    router.get('/contest/:category?', require('./contest'));
};
