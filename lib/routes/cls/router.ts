export default (router) => {
    router.get('/depth/:category?', './depth');
    router.get('/hot', './hot');
    router.get('/telegraph/:category?', './telegraph');
};
