module.exports = (router) => {
    router.get('/thread/:tid', require('./thread'));
    router.get('/digest/:tid', require('./digest'));
};
