export default (router) => {
    router.get('/funded/:username/:repo', './funded');
};
