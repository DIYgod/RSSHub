module.exports = (router) => {
    router.get('/channel/:id', require('./channel'));
    router.get('/podcast/:id', require('./podcast'));
};
