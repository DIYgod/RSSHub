export default (router) => {
    router.get('/investigates', './investigates');
    router.get('/:category/:topic?', './common');
};
