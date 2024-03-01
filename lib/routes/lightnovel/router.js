export default (router) => {
    router.get('/:keywords/:security_key?', './light-novel');
};
