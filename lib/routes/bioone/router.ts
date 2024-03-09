export default (router) => {
    router.get('/featured', './featured');
    router.get('/journals/:journal?', './journal');
};
