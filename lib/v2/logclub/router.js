module.exports = (router) => {
    router.get('/lc_report/:id?', require('./report'));
    router.get('/report/:id?', require('./report'));
    router.get('/doc', require('./doc'));
    router.get('/:category*', require('./'));
};
