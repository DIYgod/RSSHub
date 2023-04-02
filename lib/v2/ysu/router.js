module.exports = (router) => {
    router.get('/zsyjs/:type', require('./zsyjs/index'));
};
