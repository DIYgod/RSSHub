module.exports = (router) => {
    router.get('/list/:id?', require('./list'));
};
