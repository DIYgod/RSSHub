export default (router) => {
    router.get('/release/:version?', './release');
};
