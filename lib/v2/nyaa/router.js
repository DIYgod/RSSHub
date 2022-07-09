module.exports = (router) => {
    router.get('/search/:query?', require('./search'));
    router.get('/sukebei/search/:query?', require('./search'));
};
