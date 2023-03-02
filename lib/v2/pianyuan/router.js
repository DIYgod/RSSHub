module.exports = (router) => {
    router.get('/index/:media?', require('./app'));
    router.get('/indexers/pianyuan/results/search/api', require('./search'));
};
