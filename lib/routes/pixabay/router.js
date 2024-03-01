export default (router) => {
    router.get('/search/:q/:order?', './search');
};
