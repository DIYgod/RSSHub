module.exports = function (router) {
    router.get('/users/:id/:type/:language?', require('./user'));
    router.get('/videos/bestrated/:language?/:mode?', require('./bestrated'));
    router.get('/videos/genre/:genre?/:language?/:mode?', require('./genre'));
    router.get('/videos/mostwanted/:language?/:mode?', require('./mostwanted'));
    router.get('/videos/newentries/:language?', require('./newentries'));
    router.get('/videos/newrelease/:language?/:mode?', require('./newrelease'));
    router.get('/videos/update/:language?', require('./update'));

    router.get('/bestrated/:language?/:mode?', require('./bestrated'));
    router.get('/bestreviews/:language?/:mode?', require('./bestreviews'));
    router.get('/genre/:genre?/:language?/:mode?', require('./genre'));
    router.get('/mostwanted/:language?/:mode?', require('./mostwanted'));
    router.get('/newentries/:language?', require('./newentries'));
    router.get('/newrelease/:language?/:mode?', require('./newrelease'));
    router.get('/star/:id/:language?/:mode?', require('./star'));
    router.get('/update/:language?', require('./update'));
    router.get('/:type/:id/:language?', require('./user'));
};
