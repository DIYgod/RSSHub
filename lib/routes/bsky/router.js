module.exports = (router) => {
    router.get('/keyword/:keyword', './keyword');
    router.get('/profile/:handle', './posts');
};
