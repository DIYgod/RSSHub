module.exports = (router) => {
    router.get('/channel/:login', require('./channel'));
};
