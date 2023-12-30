module.exports = (router) => {
    router.get('/keyword/:keyword', require('./keyword'));
    router.get('/profile/:handle', require('./posts'));
};
