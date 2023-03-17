module.exports = (router) => {
    router.get('/podcast/:category/:id', require('./podcast.js'));
};
