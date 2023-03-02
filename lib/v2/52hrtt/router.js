module.exports = (router) => {
    router.get('/symposium/:id?/:classId?', require('./symposium'));
    router.get('/:area?/:type?', require('./'));
};
