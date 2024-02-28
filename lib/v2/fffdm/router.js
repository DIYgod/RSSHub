module.exports = function (router) {
    router.get('/manhua/:id/:cdn?', './manhua/manhua');
};
