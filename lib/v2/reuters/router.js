module.exports = (router) => {
    router.get('/investigates', './investigates');
    router.get('/:category/:topic?', './common');
};
