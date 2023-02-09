module.exports = (router) => {
    router.get('/comic/:id', require('./comic'));
};
