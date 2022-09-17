module.exports = (router) => {
    router.get('/channel/:site/:channel', require('./migration_prompt')); // deprecated
    router.get('/theWire', require('./migration_prompt')); // deprecated
    router.get('/investigates', require('./investigates'));
    router.get('/:category/:topic?', require('./common'));
};
