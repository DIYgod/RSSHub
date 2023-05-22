module.exports = (router) => {
    router.get('/article/:type?', require('./article'));
    router.get('/game/release', require('./game'));
};
