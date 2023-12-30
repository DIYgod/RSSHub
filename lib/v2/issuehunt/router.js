module.exports = (router) => {
    router.get('/funded/:username/:repo', require('./funded'));
};
