module.exports = (router) => {
    router.get('/investigates', require('./investigates'));
    router.get('/:navigation/:category?', require('./index'));
};
