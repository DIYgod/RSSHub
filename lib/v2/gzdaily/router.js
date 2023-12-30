module.exports = (router) => {
    router.get('/app/:column?', require('./app'));
};
