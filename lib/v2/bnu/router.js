module.exports = function (router) {
    router.get('/bs/:category?', require('./bs'));
};
