module.exports = function (router) {
    router.get('/:sortType?', require('./explore'));
};
