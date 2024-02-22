module.exports = (router) => {
    router.get('/espresso', require('./espresso'));
    router.get('/global-business-review/:language?', require('./global-business-review'));
    router.get('/:endpoint', require('./full'));
};
