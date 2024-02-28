module.exports = function (router) {
    router.get('/xxgk/:category', './xxgk');
    router.get('/zdyz/:category', './zdyz');
    router.get('/:channel/:category', './index');
};
