module.exports = (router) => {
    router.get('/monthly-games', require('./monthly-games'));
    router.get('/trophy/:id', require('./trophy'));
};
