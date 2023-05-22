module.exports = (router) => {
    router.get('/hotnews', require('./hotnews'));
    router.get('/kydt', require('./kydt'));
    router.get('/kyzx/:type', require('./kyzx'));
};
