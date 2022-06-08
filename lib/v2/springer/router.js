module.exports = function (router) {
    router.get('/:journal/latest', require('./latest'));
};
