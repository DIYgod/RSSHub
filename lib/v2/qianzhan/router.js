module.exports = (router) => {
    router.get('/analyst/column/:type?', require('./column'));
    router.get('/analyst/rank/:type?', require('./rank'));
};
