module.exports = (router) => {
    router.get('/news/:options?', require('./news'));
};
