export default (router) => {
    router.get('/news/zzkx', './zzkx');
    router.get('/zzkx', './zzkx');
    router.get('/video/:category?', './video');
    router.get('/:category{.+}?', './');
};
