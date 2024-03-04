export default (router) => {
    router.get('/news/:lang?', './news');
};
