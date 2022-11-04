module.exports = (router) => {
    router.get('/', require('./index'));
    router.redirect('/index', '/xwlb');
};
