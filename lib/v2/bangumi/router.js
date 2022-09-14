module.exports = function (router) {
    router.get(/moe([\w-/]+)?/, require('./moe/index'));
    router.get('/online', require('./online/online'));
    router.get('/tv/calendar/today', require('./tv/calendar/today'));
    router.get('/tv/group/:id', require('./tv/group/topic'));
    router.get('/tv/person/:id', require('./tv/person'));
    router.get('/tv/subject/:id', require('./tv/subject'));
    router.get('/tv/subject/:id/:type', require('./tv/subject'));
    router.get('/tv/topic/:id', require('./tv/group/reply'));
    router.get('/tv/user/blog/:id', require('./tv/user/blog'));
};
