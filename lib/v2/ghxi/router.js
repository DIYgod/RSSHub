module.exports = function (router) {
    router.get('/:category', require('./section'));
    router.get('/', require('./index'));
};
