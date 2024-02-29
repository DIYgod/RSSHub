module.exports = function (router) {
    router.get('/bios/:model', './bios');
    router.get('/gpu-tweak', './gpu-tweak');
};
