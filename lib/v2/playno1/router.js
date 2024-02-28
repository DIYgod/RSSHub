module.exports = (router) => {
    router.get('/av/:catid?', './av');
    router.get('/st/:catid?', './st');
};
