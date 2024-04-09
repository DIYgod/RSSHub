module.exports = function (router) {
    router.get('/manhua/:id/:cdn?', require('./manhua/manhua'));
};
