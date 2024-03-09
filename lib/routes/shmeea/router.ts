export default (router) => {
    router.get('/self-study', './self-study');
    router.get('/:id?', './index');
};
