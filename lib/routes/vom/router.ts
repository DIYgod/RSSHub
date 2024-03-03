export default (router) => {
    router.get('/featured/:lang?', './featured.js');
};
