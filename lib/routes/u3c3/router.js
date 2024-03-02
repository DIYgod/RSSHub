export default (router) => {
    router.get('/search/:keyword/:preview?', './index');
    router.get('/:type?/:preview?', './index');
};
