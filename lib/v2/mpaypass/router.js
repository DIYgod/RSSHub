module.exports = (router) => {
    router.get('/main/:type?', require('./main'));
    router.get('/news', require('./news'));
};
