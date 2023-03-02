module.exports = function (router) {
    router.get('/personal/:id', require('./personal'));
};
