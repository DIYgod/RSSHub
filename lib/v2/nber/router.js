module.exports = (router) => {
    router.get('/papers', require('.'));
    router.get('/news', require('.'));
};
