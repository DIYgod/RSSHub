module.exports = (router) => {
    router.get('/series/:mid/:sort?', require('./series'));
};
