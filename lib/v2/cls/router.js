module.exports = (router) => {
    router.get('/depth/:category?', require('./depth'));
    router.get('/hot', require('./hot'));
    router.get('/telegraph/:category?', require('./telegraph'));
};
