export default (router) => {
    router.get('/commits/:owner/:repo', './repos/commits');
    router.get('/events/:owner/:repo', './repos/events');
    router.get('/events/:username', './users/events');
    router.get('/releases/:owner/:repo', './repos/releases');
};
