module.exports = (router) => {
    router.get('/collection/:category', require('./collection'));
    router.get('/recently', require('./recently'));
};
