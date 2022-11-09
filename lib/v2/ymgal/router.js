module.exports = (router) => {
    router.get('/article/:type?', require('./article'));
};
