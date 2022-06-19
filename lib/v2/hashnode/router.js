module.exports = (router) => {
    router.get('/user/:username/posts', require('./user-posts'));
};
