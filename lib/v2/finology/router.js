module.exports = (router) => {
    router.get('/bullets', require('./bullets'));
    router.get('/:category', require('./tag'));
    router.get('/most-viewed/:time', require('./mostViewed'));
    router.get('/tag/:topic', require('./tag'));
};
