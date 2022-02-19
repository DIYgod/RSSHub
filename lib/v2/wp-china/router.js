module.export = (router) => {
    router.get('/news/:category?', require('./news'));
};
