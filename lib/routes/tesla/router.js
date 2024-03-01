export default (router) => {
    router.get('/cx/:category?/:city?', './cx');
    router.get('/price', './price');
};
