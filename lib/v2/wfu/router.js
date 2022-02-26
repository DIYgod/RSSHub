module.exports = (router) => {
    router.get('/jwc', require('./jwc'));
    router.get('/news/:type?', require('./news'));
};
