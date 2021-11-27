module.exports = function (router) {
    router.get('/liuyan/:id/:state?', require('./liuyan'));
};
