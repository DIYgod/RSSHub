module.exports = function (router) {
    router.get('/interactive-graphics', require('./interactive'));
    router.get('/realtime/:section?', require('./realtime'));
    router.get('/znews/:section?', require('./znews'));
    router.get('/:type?/:section?', require('./index'));
};
