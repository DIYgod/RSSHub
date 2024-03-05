export default (router) => {
    router.get('/index/:media?', './app');
    router.get('/indexers/pianyuan/results/search/api', './search');
};
