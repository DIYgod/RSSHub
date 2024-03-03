export default (router) => {
    router.get('/cmdp/image/', './cmdp');
    router.get('/cmdp/image/:id{.+}', './cmdp');
};
