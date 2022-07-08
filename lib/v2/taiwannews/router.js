module.exports = (router) => {
    router.get('/hot/:lang?', require('./hot'));
};
