export default (router) => {
    router.get('/av/:catid?', './av');
    router.get('/st/:catid?', './st');
};
