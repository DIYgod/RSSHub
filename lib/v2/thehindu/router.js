module.exports = (router) => {
    router.get('/topic/:topic', require('./topic'));
};
