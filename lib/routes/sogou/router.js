export default (router) => {
    router.get('/doodles', './doodles');
    router.get('/search/:keyword', './search');
};
