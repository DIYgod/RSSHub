module.exports = (router) => {
    router.get('/live/:login', require('./live'));
    router.get('/video/:login/:filter?', require('./video'));
    router.get('/schedule/:login', require('./schedule'));
};
