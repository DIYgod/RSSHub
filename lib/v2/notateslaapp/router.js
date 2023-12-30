module.exports = (router) => {
    router.get('/ota', require('./update'));
};
