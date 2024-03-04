export default (router) => {
    router.get('/hotnews', './hotnews');
    router.get('/kydt', './kydt');
    router.get('/kyzx/:type', './kyzx');
};
