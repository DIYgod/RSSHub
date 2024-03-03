export default {
    'txrjy.com': {
        _name: '通信人家园',
        '.': [
            {
                title: '论坛 频道',
                docs: 'https://docs.rsshub.app/routes/bbs#tong-xin-ren-jia-yuan',
                source: ['/c114-listnewtopic.php'],
                target: (params, url) => {
                    const channel = new URL(url).searchParams.get('typeid');

                    return `/txrjy/fornumtopic/${channel ?? ''}`;
                },
            },
        ],
    },
};
