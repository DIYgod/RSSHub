export default (router) => {
    router.get('/characters/:lang?', './index');
    router.get('/artists/:lang?', './artists');
    router.get('/archive/:lang?', './archive');
};
