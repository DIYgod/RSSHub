module.exports = (router) => {
    router.get('/journals/current/:journal', require('./current'));
};
