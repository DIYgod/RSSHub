module.exports = (router) => {
    router.get('/lm/:id?', require('./lm'));
    router.get('/photo/jx', require('./jx'));
    router.get('/xwlb', require('./xwlb'));
    router.get('/:category', require('./category'));
};
