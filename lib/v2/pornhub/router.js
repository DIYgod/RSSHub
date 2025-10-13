module.exports = (router) => {
    router.get('/category/:caty', require('./category'));
    router.get('/search/:keyword', require('./search'));
    router.get('/:language?/category_url/:url?', require('./category_url'));
    router.get('/:language?/model/:username/:sort?', require('./model'));
    router.get('/:language?/pornstar/:username/:sort?', require('./pornstar'));
    router.get('/:language?/users/:username', require('./users'));
};
