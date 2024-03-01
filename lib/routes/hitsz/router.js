export default (router) => {
    router.get('/article/:category?', './article');
};
