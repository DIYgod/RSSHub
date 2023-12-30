module.exports = function (router) {
    router.get('/discover/:query?/:subCate?/:hasVideo?/:city?/:college?/:recommendLevel?/:sort?', require('./discover'));
    router.get('/top/:type', require('./top'));
    router.get('/user/:uid', require('./user'));
};
