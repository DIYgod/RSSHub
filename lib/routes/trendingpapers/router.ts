export default (router) => {
    router.get('/papers/:category?/:time?/:cited?', './papers.js');
};
