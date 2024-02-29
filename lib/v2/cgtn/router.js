module.exports = (router) => {
    router.get('/podcast/:category/:id', './podcast.js');
};
