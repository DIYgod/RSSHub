module.exports = (router) => {
    router.get('/commits/:owner/:repo', require('./repos/commits'));
    router.get('/events/:owner/:repo', require('./repos/events'));
    router.get('/events/:username', require('./users/events'));
    router.get('/releases/:owner/:repo', require('./repos/releases'));
};
