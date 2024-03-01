export default (router) => {
    // router.get('/vul', './vul'); // 404
    router.get('/:category/:fulltext?', './category');
};
