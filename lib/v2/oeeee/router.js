module.exports = (router) => {
    router.get('/web/:channel', require('./web'));
    router.get('/app/channel/:id', require('./app/channel'));
    router.get('/app/reporter/:id', require('./app/reporter'));
};
