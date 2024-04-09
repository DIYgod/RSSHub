module.exports = function (router) {
    router.get('/post/:language?/:keyword?', require('./post'));
    router.get('/contest/:language?/:rated?/:category?/:keyword?', require('./contest'));
};
