export default (router) => {
    router.get('/podcast/:category/:id', './podcast.js');
};
