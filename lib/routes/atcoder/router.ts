export default (router) => {
    router.get('/post/:language?/:keyword?', './post');
    router.get('/contest/:language?/:rated?/:category?/:keyword?', './contest');
};
