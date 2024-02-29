module.exports = (router) => {
    router.get('/search/:q/:order?', './search');
};
