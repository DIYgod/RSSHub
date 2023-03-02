module.exports = function (router) {
    router.get('/:domain', require('./index.js'));
};
