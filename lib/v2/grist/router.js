module.exports = (router) => {
    router.get('/', require('./index'));
    router.get('/featured', require('./featured'));
};
