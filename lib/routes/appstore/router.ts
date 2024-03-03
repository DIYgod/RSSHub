export default (router) => {
    router.get('/xianmian', './xianmian');
    router.get('/iap/:country/:id', './in-app-purchase');
    router.get('/price/:country/:type/:id', './price');
};
