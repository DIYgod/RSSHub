export default (router) => {
    router.get('/addons/:id', './addons');
    router.get('/breaches', './breaches');
    router.get('/release/:platform?', './release');
};
