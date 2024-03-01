export default (router) => {
    router.get('/:user/:type?', './user');
};
