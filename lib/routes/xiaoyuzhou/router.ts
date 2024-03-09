export default (router) => {
    router.get('/podcast/:id', './podcast');
    router.get('/', './pickup');
};
