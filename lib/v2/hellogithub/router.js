module.exports = (router) => {
    router.get('/article/:sort?/:id?', require('./index'));
    router.get('/month', require('./volume'));
    router.get('/ranking/:type?', require('./report'));
    router.get('/report/:type?', require('./report'));
    router.get('/volume', require('./volume'));
    router.get('/:sort?/:id?', require('./index'));
};
