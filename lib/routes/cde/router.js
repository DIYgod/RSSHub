export default (router) => {
    router.get('/xxgk/:category', './xxgk');
    router.get('/zdyz/:category', './zdyz');
    router.get('/:channel/:category', './index');
};
