export default (router) => {
    router.get('/shopping-guide/:category?/:language?', './shopping-guide');
    router.get('/:category?/:language?/:keyword?', './index');
};
