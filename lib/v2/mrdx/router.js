module.exports = (router) => {
    router.get('/today', require('./daily'));
};
