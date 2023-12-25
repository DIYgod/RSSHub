module.exports = function (router) {
    router.get('/recent', require('./recent.js'));
};
