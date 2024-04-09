module.exports = (router) => {
    router.get('/commits/:workspace/:repo_slug', require('./commits'));
    router.get('/tags/:workspace/:repo_slug', require('./tags'));
};
