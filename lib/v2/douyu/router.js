module.exports = function (router) {
    router.get('/group/:id/:sort?', require('./group'));
    router.get('/post/:id', require('./post'));
    router.get('/room/:id', require('./room'));
};
