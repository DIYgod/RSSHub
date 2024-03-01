export default (router) => {
    router.get('/latest-magazine/:query?', './latest-magazine');
};
