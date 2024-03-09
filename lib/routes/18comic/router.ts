export default (router) => {
    router.get('/album/:id', './album');
    router.get('/blogs/:category?', './blogs');
    router.get('/search/:option?/:category?/:keyword?/:time?/:order?', './search');
    router.get('/:category?/:time?/:order?/:keyword?', './index');
};
