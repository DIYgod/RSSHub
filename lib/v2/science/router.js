module.exports = (router) => {
    router.get('/cover', require('./cover'));
    router.get('/current/:journal?', require('./current'));
    router.get('/early/:journal?', require('./early'));
    router.get('/blogs/:name?', require('./blogs'));
};
