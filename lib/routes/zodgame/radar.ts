export default {
    'zodgame.xyz': {
        _name: 'zodgame',
        '.': [
            {
                title: '论坛版块',
                docs: 'https://docs.rsshub.app/routes/bbs#zodgame',
                source: '/forum.php',
                target: (params, url) => {
                    const fid = new URL(url).searchParams.get('fid');
                    if (fid) {
                        return `/zodgame/forum/${fid}`;
                    }
                },
            },
        ],
    },
};
