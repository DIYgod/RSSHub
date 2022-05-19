module.exports = function (router) {
    router.get('/lever/:domain', require('./index.js'));
};
