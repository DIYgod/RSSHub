module.exports = (router) => {
    router.get('/novel/:id', require('./novel'));
};
