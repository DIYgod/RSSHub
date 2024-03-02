export default (router) => {
    router.get('/notes/character/:characterId', './notes/character');
    router.get('/notes/source/:source', './notes/source');
    router.get('/notes', './notes/index');
    router.get('/feeds/following/:characterId', './feeds/following');
};
