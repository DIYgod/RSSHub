export default (router) => {
    router.get('/discount/:platform/:filter?/:countries?', './discount.js');
};
