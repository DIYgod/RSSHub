export default {
    'hjd2048.com': {
        _name: '2048 核基地',
        '.': [
            {
                title: '论坛',
                docs: 'https://docs.rsshub.app/routes/multimedia#2048-he-ji-di',
                source: ['/2048/thread.php?fid-3.html'],
                target: (_, url) => `/2048/${url.match(/fid-(\d+?)\.html/)[1]}`,
            },
        ],
    },
};
