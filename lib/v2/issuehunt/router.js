module.exports = (router) => {
    router.get('/funded/:username/:repo', './funded');
};
