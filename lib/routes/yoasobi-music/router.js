export default (router) => {
    router.get('/info/:category?', './info'); // news, biography
    router.get('/live', './live');
    router.get('/media', './media');
};
