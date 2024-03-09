export default (router) => {
    router.get('/briefing-room/:category?', './briefing-room');
    router.get('/ostp', './ostp');
};
