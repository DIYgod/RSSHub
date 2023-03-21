module.exports = (router) => {
    router.get('/kydt', require('./kydt'));
    router.get('/hotnews', require('./hotnews'));
};
