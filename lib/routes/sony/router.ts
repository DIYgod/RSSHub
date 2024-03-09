export default (router) => {
    router.get('/downloads/:productType/:productId', './downloads');
};
