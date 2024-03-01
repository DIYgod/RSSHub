module.exports = function (router) {
    router.get('/rank', require('./rank'));
    router.get('/cheaps/:query?', require('./cheaps'));
    router.get('/search/:query?', require('./search'));
    router.get('/:query?', require('./index'));
};
