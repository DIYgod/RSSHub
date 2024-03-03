export default (router) => {
    // bangumi.moe
    router.get('/moe/*', './moe/index');
    // bangumi.online
    router.get('/online', './online/online');
    // bangumi.tv
    router.get('/tv/calendar/today', './tv/calendar/today');
    router.get('/tv/followrank', './tv/other/followrank');
    router.get('/tv/group/:id', './tv/group/topic');
    router.get('/tv/person/:id', './tv/person');
    router.get('/tv/subject/:id/:type?/:showOriginalName?', './tv/subject');
    router.get('/tv/topic/:id', './tv/group/reply');
    router.get('/tv/user/blog/:id', './tv/user/blog');
    router.get('/tv/user/wish/:id', './tv/user/wish');
};
