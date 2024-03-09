export default (router) => {
    router.get('/article/:type?', './article');
    router.get('/game/release', './game');
};
