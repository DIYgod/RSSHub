module.exports = (router) => {
    router.get('/live/room/:id', require('./room'));
};
