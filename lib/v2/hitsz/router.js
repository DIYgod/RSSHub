module.exports = (router) => {
    router.get('/article/:category?', require('./article'));
};
