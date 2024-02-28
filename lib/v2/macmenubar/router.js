module.exports = (router) => {
    router.get('/recently/:category?', './recently');
};
