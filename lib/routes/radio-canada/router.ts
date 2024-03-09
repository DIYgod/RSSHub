export default (router) => {
    router.get('/latest/:language?', './latest');
};
