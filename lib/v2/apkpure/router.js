module.exports = (router) => {
    router.get('/versions/:pkg/:region?', './versions');
};
