module.exports = (router) => {
    // router.get('/vul', require('./vul')); // 404
    router.get('/:category', require('./category'));
};
