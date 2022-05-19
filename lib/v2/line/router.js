module.exports = function (router) {
    router.get('/today/:edition?/:tab?', require('./today'));
};
