module.exports = (router) => {
    router.get('/news/:option?', require('./news'));
};
