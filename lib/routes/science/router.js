export default (router) => {
    router.get('/blogs/:name?', './blogs');
    router.get('/cover', './cover');
    router.get('/current/:journal?', './current');
    router.get('/early/:journal?', './early');
};
