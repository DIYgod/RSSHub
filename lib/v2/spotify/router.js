module.exports = function (router) {
    router.get('/artist/:id', require('./artist'));
    router.get('/playlist/:id', require('./playlist'));
    router.get('/saved/:limit?', require('./saved'));
    router.get('/top/tracks', require('./top')('tracks'));
    router.get('/top/artists', require('./top')('artists'));
};
