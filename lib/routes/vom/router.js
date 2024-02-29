module.exports = (router) => {
    router.get('/featured/:lang?', './featured.js');
};
