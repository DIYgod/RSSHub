module.exports = (router) => {
    router.get('/usenix/usenix-security-sympoium', require('./usenix'));
    router.get('/ieee-security/security-privacy', require('./sp'));
    router.get('/sigsac/ccs', require('./ccs'));
};
