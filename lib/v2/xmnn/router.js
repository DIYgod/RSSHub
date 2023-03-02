module.exports = function (router) {
    router.get('/epaper/:id?', require('./epaper'));
};
