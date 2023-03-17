module.exports = (router) => {
    router.get('/podcast/:category/:id/:content?', require('./podcast.js'));
};
