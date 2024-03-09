export default (router) => {
    router.get('/bt/:subforumid?', './index');
    router.get('/picture/:subforumid', './index');
    router.get('/user/:uid', './user');
    router.get('/:subforumid?/:type?', './index');
    router.get('/:subforumid?', './index');
    router.get('', './index');
};
