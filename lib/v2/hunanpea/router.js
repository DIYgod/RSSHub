module.exports = (router) => {
    router.get('/rsks/:guid', require('./rsks'));
};
