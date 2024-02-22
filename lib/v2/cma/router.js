module.exports = (router) => {
    router.get('/channel/:id?', require('./channel'));
};
