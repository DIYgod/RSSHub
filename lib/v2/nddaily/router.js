module.exports = (router) => {
    router.get('/oeeee/:channel', require('./oeeee'));
    router.get('/ndapp/channel/:id', require('./ndapp/channel'));
    router.get('/ndapp/reporter/:id', require('./ndapp/reporter'));
};
