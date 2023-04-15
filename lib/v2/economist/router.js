module.exports = (router) => {
    router.get('/download', require('./download'));
    router.get('/espresso', require('./espresso'));
    router.get('/gre-vocabulary', require('./gre-vocabulary'));
    router.get('/global-business-review/:language?', require('./global-business-review'));
    router.get('/:endpoint', require('./full'));
};
