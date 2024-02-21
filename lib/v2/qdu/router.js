module.exports = (router) => {
    router.get('/jwc', require('./jwc'));
    router.get('/houqin', require('./houqin'));
};
