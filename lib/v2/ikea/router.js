module.exports = (router) => {
    router.get('/gb/new', require('./gb/new'));
    router.get('/gb/offer', require('./gb/offer'));
};
