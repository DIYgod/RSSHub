module.exports = (router) => {
    router.get('/author/:id', require('./author'));
};
