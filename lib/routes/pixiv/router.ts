export default (router) => {
    router.get('/ranking/:mode/:date?', './ranking');
    router.get('/search/:keyword/:order?/:mode?', './search');
    router.get('/user/bookmarks/:id', './bookmarks');
    router.get('/user/illustfollows', './illustfollow');
    router.get('/user/novels/:id', './novels');
    router.get('/user/:id', './user');
};
