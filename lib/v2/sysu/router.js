module.exports = function (router) {
    router.get('/cse', require('./cse'));
    router.get('/ygafz/:type?', require('./ygafz'));
};
