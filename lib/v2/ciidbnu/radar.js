module.exports = {
    'ciidbnu.org': {
        _name: '中国收入分配研究院',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#',
                source: ['/new1.asp', '/'],
                target: (_params, url) => `/ciidbnu/${new URL(url).searchParams.get('pagetype')}`,
            },
        ],
    },
};
