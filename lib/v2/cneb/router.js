module.exports = function (router) {
    router.get('/yjxw/:category?', require('./yjxw'));
    router.get(/\/yjxx([\w-/]+)?/, require('./yjxx'));
    router.redirect('/guoneinews', '/cneb/yjxw/gnxw');
};
