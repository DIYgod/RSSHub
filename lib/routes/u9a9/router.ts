export default (router) => {
    router.get('/:preview?', './index');
    router.get('/search/:keyword/:preview?', './index');
};
