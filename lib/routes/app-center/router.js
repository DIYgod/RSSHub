export default (router) => {
    router.get('/release/:user/:app/:distribution_group', './release');
};
