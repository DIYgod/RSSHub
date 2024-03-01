export default (router) => {
    router.get('/artist/:id', './artist');
    router.get('/playlist/:id', './playlist');
    router.get('/saved/:limit?', './saved');
    router.get('/show/:id', './show');
    router.get('/top/artists', './artists-top');
    router.get('/top/tracks', './tracks-top');
};
