module.exports = (router) => {
    router.get('/trending/:category/:allowPaid?/:limit?', require('./index'));
};
