module.exports = {
    'cbaigui.com': {
        _name: '纪妖',
        '.': [
            {
                title: '通用',
                docs: 'https://docs.rsshub.app/new-media.html#ji-yao-tong-yong',
                source: ['/'],
                target: (params, url) => {
                    url = new URL(url);
                    const path = url.href.match(/\.com(.*?)/)[1];

                    return `/cbaigui${path}`;
                },
            },
        ],
    },
};
