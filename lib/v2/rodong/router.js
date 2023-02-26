module.exports = (router) => {
    router.get('/news/:language?', require('./news'));
};
