module.exports = (router) => {
    router.get('/articles', require('./article'));
    router.get('/essays', require('./article'));
    router.get('/', require('./article'));
};
