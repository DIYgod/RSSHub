module.exports = function (router) {
    router.get('/exhibitions/:state?', require('./exhibitions'));
};
