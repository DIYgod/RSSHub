module.exports = (router) => {
    router.get('/featured/:lang?', require('./featured.js'));
};
