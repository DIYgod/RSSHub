module.exports = function (router) {
    router.get('/:journal/latest', require('./latest'));
    router.get('/:journal/vol/:id', require('./volume'));
};
