module.exports = function (router) {
    router.get('/:userid', require('./user'));
};
