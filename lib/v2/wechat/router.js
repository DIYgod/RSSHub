module.exports = function (router) {
    router.get('/feeddd/:id', require('./feeddd'));
    router.get('/data258/:id?', require('./data258'));
};
