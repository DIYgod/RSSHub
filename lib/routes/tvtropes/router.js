module.exports = (router) => {
    router.get('/featured/:category?', require('./featured'));
};
