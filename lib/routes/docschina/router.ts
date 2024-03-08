export default (router) => {
    router.get('/weekly/:category', './weekly');
    router.get('/weekly/', './weekly');
    router.get('/weekly', './weekly');
};
