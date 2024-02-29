module.exports = (router) => {
    router.get('/index/:keyword/:channel?', './arithmetic-index');
};
