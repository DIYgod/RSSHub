module.exports = function (router) {
    router.get('/:journal/latest/date/:sortType?', require('./latestdate'));
    router.get('/:journal/latest/vol/:sortType?', require('./latestvol'));
};
