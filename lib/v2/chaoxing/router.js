module.exports = function (router) {
    router.get('/qk/:id/:needContent?', require('./qk'));
};
