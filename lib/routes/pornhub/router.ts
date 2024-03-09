export default (router) => {
    router.get('/category/:caty', './category');
    router.get('/search/:keyword', './search');
    router.get('/:language?/category_url/:url?', './category-url');
    router.get('/:language?/model/:username/:sort?', './model');
    router.get('/:language?/pornstar/:username/:sort?', './pornstar');
    router.get('/:language?/users/:username', './users');
};
