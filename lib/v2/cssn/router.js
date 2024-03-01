module.exports = function (router) {
    router.get('/iolaw/:section?', require('./iolaw'));
};
