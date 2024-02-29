module.exports = function (router) {
    router.get('/cse', './cse');
    router.get('/ygafz/:type?', './ygafz');
};
