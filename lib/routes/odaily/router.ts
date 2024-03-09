export default (router) => {
    router.get('/activity', './activity');
    router.get('/newsflash', './newsflash');
    router.get('/search/news/:keyword', './search-news');
    router.get('/user/:id', './user');
    router.get('/:id?', './post');
};
