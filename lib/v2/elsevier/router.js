module.exports = function (router) {
    router.get('/:journal', require('./journal'));
    router.get('/:journal/:issue', require('./issue'));
    router.get('/:journal/latest', require('./journal'));
    router.get('/:journal/vol/:issue', require('./issue'));
};
