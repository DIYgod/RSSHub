export default (router) => {
    router.get('/news/:language?', './news');
    router.get('/news-room/:category?/:language?', './news-room');
    router.get('/speeches/:language?', './speeches');
};
