module.exports = function (router) {
    router.get('/branches/:user/:repo', require('./branches'));
    router.get('/comments/:user/:repo/:type/:number', require('./comments'));
    router.get('/contributors/:user/:repo/:order?/:anon?', require('./contributors'));
    router.get('/file/:user/:repo/:branch/:filepath+', require('./file'));
    router.get('/issue/:user/:repo/:state?/:labels?', require('./issue'));
    router.get('/pull/:user/:repo', require('./pulls'));
    router.get('/repos/:user', require('./repos'));
    router.get('/search/:query/:sort?/:order?', require('./search'));
    router.get('/starred_repos/:user', require('./starred_repos'));
    router.get('/stars/:user/:repo', require('./star'));
    router.get('/topics/:name/:qs?', require('./topic'));
    router.get('/trending/:since/:language/:spoken_language?', require('./trending'));
    router.get('/user/followers/:user', require('./follower'));
};
