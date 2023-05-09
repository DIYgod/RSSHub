module.exports = (router) => {
    router.get('/maitta', require('./maitta'));
    router.get('/radio/:id?', require('./radio'));
};
