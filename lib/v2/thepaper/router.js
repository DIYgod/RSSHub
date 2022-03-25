module.exports = function (router) {
    router.get('/839studio', require('./839studio/studio'));
    router.get('/839studio/:id', require('./839studio/category'));
    router.get('/channel/:id', require('./channel'));
    router.get('/featured', require('./featured'));
    router.get('/factpaper/:status?', require('./factpaper'));
    router.get('/list/:id', require('./list'));
};
