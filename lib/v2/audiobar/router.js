module.exports = function (router) {
    router.get('/audiobar/latest', require('./latest'));
};
