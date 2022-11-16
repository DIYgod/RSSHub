module.exports = (router) => {
    router.get('/search/:query?', require('./main'));
    router.get('/user/:username?', require('./main'));
    router.get('/user/:username/search/:query?', require('./main'));

    router.get('/sukebei/search/:query?', require('./main'));
    router.get('/sukebei/user/:username?', require('./main'));
    router.get('/sukebei/user/:username/search/:query?', require('./main'));
};
