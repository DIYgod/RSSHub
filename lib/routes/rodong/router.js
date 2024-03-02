export default (router) => {
    router.get('/news/:language?', './news');
};
