module.exports = function (router) {
    router.get('/album/:id', require('./album'));
    router.get('/blogs/:category?', require('./blogs'));
    router.get('/search/:option?/:category?/:keyword?/:time?/:order?', require('./search'));
    router.get('/:category?/:time?/:order?/:keyword?', require('./index'));
};
