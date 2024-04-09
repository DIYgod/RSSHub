module.exports = (router) => {
    router.get('/:id?/:downLinkType?', require('./'));
};
