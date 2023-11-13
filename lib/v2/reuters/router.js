module.exports = (router) => {
    router.get('/investigates', require('./investigates'));
    router.get('/:category/:topic?', require('./common'));
};
