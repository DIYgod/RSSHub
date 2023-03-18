module.exports = (router) => {
    router.get('/:lang/:category?', require('./news'));
};
