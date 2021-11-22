module.exports = function (router) {
    router.get('/dh/:language?', require('./dh'));
};
