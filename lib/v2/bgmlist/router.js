module.exports = (router) => {
    router.get('/onair/:lang?', require('./onair'));
};
