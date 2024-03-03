export default (router) => {
    router.get('/symposium/:id?/:classId?', './symposium');
    router.get('/:area?/:type?', './');
};
