module.exports = function (router) {
    router.get('/bios/:model', require('./bios'));
};
