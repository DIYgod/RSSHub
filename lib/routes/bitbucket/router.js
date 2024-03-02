export default (router) => {
    router.get('/commits/:workspace/:repo_slug', './commits');
    router.get('/tags/:workspace/:repo_slug', './tags');
};
