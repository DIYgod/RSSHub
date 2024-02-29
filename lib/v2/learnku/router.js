module.exports = function (router) {
    router.get('/:community/:category?', './topic.js');
};
