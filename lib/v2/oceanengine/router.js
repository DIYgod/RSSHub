module.exports = (router) => {
    router.get('/index/:keyword/:channel?', require('./arithmetic-index'));
};
