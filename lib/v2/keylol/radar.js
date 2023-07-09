module.exports = {
    'keylol.com': {
        _name: '其乐',
        '.': [
            {
                title: '论坛',
                docs: 'https://docs.rsshub.app/game.html#qi-le-lun-tan',
                source: ['/:category', '/'],
                target: (params, url) => {
                    url = new URL(url);
                    const path = url.href.match(/keylol\.com\/(forum.php\?.*|f\d+-\d+)?/).replace(/forum.php\?/, '')[1];

                    return `/keylol${path ? `/${path}` : ''}`;
                },
            },
        ],
    },
};
