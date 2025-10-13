module.exports = (router) => {
    router.get('/topics/:topic?', require('./topics'));
};
