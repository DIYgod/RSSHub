module.exports = (router) => {
    router.get('/news/zzkx', require('./zzkx'));
    router.get('/zzkx', require('./zzkx'));
};
