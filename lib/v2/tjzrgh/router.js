module.exports = function (router) {
    router.get('/:type/:area?', require('./ghgs.js'));
};
