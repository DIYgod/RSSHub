export default (router) => {
    router.get('/report/:industry?/:label?', './report');
};
