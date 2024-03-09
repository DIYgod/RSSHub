export default (router) => {
    router.get('/activity/:city/:category/:subcategory/:keyword?', './activity');
};
