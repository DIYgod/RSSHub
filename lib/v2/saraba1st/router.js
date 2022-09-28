module.exports = (router) => {
    router.get('/thread/:tid', require('./thread'));
};
