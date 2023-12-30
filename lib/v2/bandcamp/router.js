module.exports = function (router) {
    router.get('/tag/:tag?', require('./tag'));
    router.get('/live', require('./live'));
    router.get('/weekly', require('./weekly'));
};
