export default (router) => {
    router.get('/news/:type?', './type');
};
