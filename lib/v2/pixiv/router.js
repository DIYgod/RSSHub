module.exports = (router) => {
    router.get('/ranking/:mode/:date?', require('./ranking'));
    router.get('/search/:keyword/:order?/:mode?', require('./search'));
    router.get('/user/bookmarks/:id', require('./bookmarks'));
    router.get('/user/illustfollows', require('./illustfollow'));
    router.get('/user/novels/:id', require('./novels'));
    router.get('/user/:id', require('./user'));
};
