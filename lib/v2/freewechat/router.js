module.exports = (router) => {
    router.get('/profile/:id', require('./profile'));
};
