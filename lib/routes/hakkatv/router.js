module.exports = (router) => {
    router.get('/news/:type?', './type');
};
