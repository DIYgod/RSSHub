export default (router) => {
    router.get('/bgw/:code', './bgw');
    router.get('/cjxy/:code', './cjxy');
    router.get('/dean/:code', './dean');
    router.get('/dxy/:code', './dxy');
    router.get('/is/:code', './is');
    router.get('/scs/:code', './scs');
};
