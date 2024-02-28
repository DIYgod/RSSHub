module.exports = (router) => {
    router.get('/search/:category?/:order?/:time?/:query?', './search');
};
