export default (router) => {
    router.get('/index/:keyword/:channel?', './arithmetic-index');
};
