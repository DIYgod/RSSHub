module.exports = function (router) {
    router.get('/interactive-graphics', './interactive');
    router.get('/realtime/:section?', './realtime');
    router.get('/znews/:section?', './znews');
    router.get('/:type?/:section?', './index');
};
