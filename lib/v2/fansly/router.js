module.exports = (router) => {
    router.get('/tag/:tag', require('./tag'));
    router.get('/user/:username', require('./post'));
};
