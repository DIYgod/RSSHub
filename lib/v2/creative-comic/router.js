module.exports = (router) => {
    router.get('/book/:id/:coverOnly?/:quality?', require('./book'));
};
