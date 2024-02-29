module.exports = function (router) {
    router.get('/journal/:id/:category?', './journal');
};
