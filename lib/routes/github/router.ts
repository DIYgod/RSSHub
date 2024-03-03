export default (router) => {
    router.get('/branches/:user/:repo', './branches');
    router.get('/comments/:user/:repo/:type/:number', './comments'); // deprecated
    router.get('/comments/:user/:repo/:number?', './comments');
    router.get('/contributors/:user/:repo/:order?/:anon?', './contributors');
    router.get('/file/:user/:repo/:branch/:filepath+', './file');
    router.get('/gist/:gistId', './gist');
    router.get('/issue/:user/:repo/:state?/:labels?', './issue');
    router.get('/notifications', './notifications');
    router.get('/pull/:user/:repo/:state?/:labels?', './pulls');
    router.get('/pulse/:user/:repo/:period?', './pulse');
    router.get('/repos/:user', './repos');
    router.get('/search/:query/:sort?/:order?', './search');
    router.get('/starred_repos/:user', './starred-repos');
    router.get('/stars/:user/:repo', './star');
    router.get('/topics/:name/:qs?', './topic');
    router.get('/trending/:since/:language/:spoken_language?', './trending');
    router.get('/user/followers/:user', './follower');
    router.get('/wiki/:user/:repo/:page?', './wiki');
};
