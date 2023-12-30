module.exports = (router) => {
    router.get('/:appId', require('./update'));
};
