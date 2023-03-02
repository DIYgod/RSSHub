module.exports = (router) => {
    router.get('/index/:keyword/:channel?', require('./arithmeticIndex'));
};
