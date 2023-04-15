module.exports = function (router) {
    router.get('/today/:edition?/:tab?', require('./today'));
    router.get('/today/:edition/publisher/:id', require('./publisher'));
};
