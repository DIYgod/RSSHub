module.exports = (router) => {
    router.get('/symposium/:id?/:classId?', './symposium');
    router.get('/:area?/:type?', './');
};
