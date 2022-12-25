module.exports = (router) => {
    router.get('/usenix', require('./usenix'));
    router.get('/sp', require('./sp'));
    router.get('/ccs', require('./ccs'));
};
