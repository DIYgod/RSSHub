module.exports = function (router) {
    return router.get('/seminars/:period', require('.'));
};
