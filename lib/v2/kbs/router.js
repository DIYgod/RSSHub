module.exports = (router) => {
    router.get('/news/:category?/:language?', require('./news'));
    router.get('/today/:language?', require('./today'));
};
