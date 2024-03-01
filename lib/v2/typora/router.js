module.exports = (router) => {
    router.get('/changelog', require('./changelog'));
    router.get('/changelog/dev', require('./changelog-dev'));
};
