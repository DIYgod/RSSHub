module.exports = (router) => {
    router.get('/rss', require('./routes')); // 弃用

    router.get('/routes/:lang?', require('./routes'));
    router.get('/sponsors', require('./sponsors'));
};
