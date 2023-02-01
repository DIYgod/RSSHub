module.exports = (router) => {
    router.get('/album/:id', require('./album'));
    router.get('/user/video/:uid', require('./video'));
};
