module.exports = {
    'radio.cn': {
        _name: '云听',
        '.': [
            {
                title: '电台节目',
                docs: 'https://docs.rsshub.app/multimedia.html#yun-ting-dian-tai-jie-mu',
                source: ['/pc-portal/sanji/detail.html', '/'],
                target: (params, url) => `/radio/${new URL(url).searchParams.get('columnId')}`,
            },
        ],
    },
};
