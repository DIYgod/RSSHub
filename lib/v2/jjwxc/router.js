module.exports = (router) => {
    router.get('/author/:id?', require('./author'));
    router.get('/book/:id?', require('./book'));
};
