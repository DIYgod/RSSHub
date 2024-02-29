module.exports = (router) => {
    router.get('/report/:industry?/:label?', './report');
};
