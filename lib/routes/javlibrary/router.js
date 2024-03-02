export default (router) => {
    router.get('/users/:id/:type/:language?', './user');
    router.get('/videos/bestrated/:language?/:mode?', './bestrated');
    router.get('/videos/genre/:genre?/:language?/:mode?', './genre');
    router.get('/videos/maker/:maker?/:language?/:mode?', './maker');
    router.get('/videos/mostwanted/:language?/:mode?', './mostwanted');
    router.get('/videos/newentries/:language?', './newentries');
    router.get('/videos/newrelease/:language?/:mode?', './newrelease');
    router.get('/videos/update/:language?', './update');

    router.get('/bestrated/:language?/:mode?', './bestrated');
    router.get('/bestreviews/:language?/:mode?', './bestreviews');
    router.get('/genre/:genre?/:language?/:mode?', './genre');
    router.get('/mostwanted/:language?/:mode?', './mostwanted');
    router.get('/newentries/:language?', './newentries');
    router.get('/newrelease/:language?/:mode?', './newrelease');
    router.get('/star/:id/:language?/:mode?', './star');
    router.get('/update/:language?', './update');
    router.get('/:type/:id/:language?', './user');
};
