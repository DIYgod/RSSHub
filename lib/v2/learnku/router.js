module.exports = function (router) {
    router.get('/:community/:category?', require('./topic.js'));
};
