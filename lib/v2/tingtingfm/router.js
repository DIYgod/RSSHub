module.exports = (router) => {
    router.get('/program/:programId', require('./program'));
};
