module.exports = function (router) {
    router.get('/:subsite/:tag?', require('./subsite'));
};
