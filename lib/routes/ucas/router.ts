export default (router) => {
    router.get('/ai', './ai');
    router.get('/job/:type?', './index');
};
