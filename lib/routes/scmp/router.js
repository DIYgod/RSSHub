export default (router) => {
    router.get('/coronavirus', './coronavirus');
    router.get('/:category_id', './index');
    router.get('/topics/:topic', './topic');
};
