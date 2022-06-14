module.exports = function (router) {
    router.get('/:journal', require('./latest'));
};
