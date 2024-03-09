export default (router) => {
    router.get('/build/:owner/:image/:tag?', './build');
    router.get('/tag/:owner/:image/:limits?', './tag');
};
