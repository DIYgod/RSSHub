module.exports = function (router) {
    router.get('/fornumtopic/:channel?', require('./fornumtopic'));
};
