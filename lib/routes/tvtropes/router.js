export default (router) => {
    router.get('/featured/:category?', require('./featured'));
};
