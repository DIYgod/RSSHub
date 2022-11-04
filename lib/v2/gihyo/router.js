module.exports = function (router) {
    router.get('/list/group/:id', require('./group'));
};
