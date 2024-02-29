module.exports = function (router) {
    router.get('/post/:language?/:keyword?', './post');
    router.get('/contest/:language?/:rated?/:category?/:keyword?', './contest');
};
