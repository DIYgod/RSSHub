module.exports = (router) => {
    router.get('/forum/:id', require('./forum'));
    router.get('/more/:category?', require('./more'));
    router.get('/post/:id', require('./post'));
};
