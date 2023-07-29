module.exports = function (router) {
    router.get('/channel/:channel', require('./channel'));
    router.get('/channel/:channel/:media(.+)', require('./channel')); // actually handled via core_router to avoid cache locking
};
