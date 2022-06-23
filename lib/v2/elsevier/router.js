module.exports = function (router) {
    router.get('/:journal/latest', require('./journal')); // deprecated
    router.get('/:journal/vol/:issue', require('./issue')); // deprecated
    router.get('/:journal', require('./journal'));
    router.get('/:journal/:issue', require('./issue'));
};
