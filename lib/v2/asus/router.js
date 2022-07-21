module.exports = function (router) {
    router.get('/bios/:model', require('./bios'));
    router.get('/gpu-tweak', require('./gpu-tweak'));
};
