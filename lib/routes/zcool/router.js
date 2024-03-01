export default (router) => {
    router.get('/discover/:query?/:subCate?/:hasVideo?/:city?/:college?/:recommendLevel?/:sort?', './discover');
    router.get('/top/:type', './top');
    router.get('/user/:uid', './user');
};
