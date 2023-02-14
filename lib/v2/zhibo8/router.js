module.exports = (router) => {
    router.get('/forum/:id', require('./forum'));
    router.get('/luxiang/:category?', require('./luxiang'));
    router.get('/more/:category?', require('./more'));
    router.get('/post/:id', require('./post'));
};
