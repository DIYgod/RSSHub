module.exports = (router) => {
    router.get('/rank/:type?', require('./rank'));
    router.get('/column/:type?', require('./column'));
};
