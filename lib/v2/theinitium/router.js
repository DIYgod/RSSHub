module.exports = (router) => {
    router.get('/:model?/:type?/:language?', require('./full'));
};
