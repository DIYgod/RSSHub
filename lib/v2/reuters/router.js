module.exports = (router) => {
    router.get('/investigates', require('./investigates'));
    router.get('/reuters/channel/:site/:channel', require('./migration_prompt')); // deprecated
    router.get('/reuters/theWire', require('./migration_prompt')); // deprecated
    router.get('/:category/:topic?', require('./common'));
};
