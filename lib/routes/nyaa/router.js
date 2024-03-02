export default (router) => {
    router.get('/search/:query?', './main');
    router.get('/user/:username?', './main');
    router.get('/user/:username/search/:query?', './main');

    router.get('/sukebei/search/:query?', './main');
    router.get('/sukebei/user/:username?', './main');
    router.get('/sukebei/user/:username/search/:query?', './main');
};
