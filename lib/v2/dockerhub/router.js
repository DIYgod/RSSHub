module.exports = function (router) {
    router.get('/build/:owner/:image/:tag?', require('./build'));
    router.get('/tag/:owner/:image/:limits?', require('./tag'));
};
