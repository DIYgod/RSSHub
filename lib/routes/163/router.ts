export default (router) => {
    router.get('/exclusive/:id?', './exclusive');
    router.get('/ds/:id', './ds');
    router.get('/dy/:id', './dy');
    router.get('/dy2/:id', './dy2');

    router.get('/music/artist/:id', './music/artist');
    router.get('/music/artist/songs/:id', './music/artist-songs');
    router.get('/music/djradio/:id', './music/djradio');
    router.get('/music/playlist/:id', './music/playlist');
    router.get('/music/user/events/:id', './music/userevents');
    router.get('/music/user/playlist/:uid', './music/userplaylist');
    router.get('/music/user/playrecords/:uid/:type?', './music/userplayrecords');

    router.get('/news/rank/:category?/:type?/:time?', './news/rank');
    router.get('/news/special/:type?', './news/special');
    router.get('/open/vip', './open/vip');
    router.get('/renjian/:category?', './renjian');
    router.get('/today/:need_content?', './today');
};
