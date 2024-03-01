export default (router) => {
    router.get('/new-arrivals/:country/:gender', './new-arrivals');
    router.get('/outlet/:country/:gender', './outlet');
    router.get('/regear/new-arrivals', './regear-new-arrivals');
};
