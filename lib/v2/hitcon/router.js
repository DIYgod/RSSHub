module.exports = (router) => {
    router.get('/zeroday/vulnerability/:type?', require('./zeroday/vulnerability'));
};
