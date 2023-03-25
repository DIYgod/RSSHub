module.exports = {
    'cankaoxiaoxi.com': {
        _name: '参考消息',
        '.': [
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/traditional-media.html#can-kao-xiao-xi-lan-mu',
                source: ['/'],
                target: (params, url) => {
                    const urlStr = new URL(url).toString();
                    return `/cankaoxiaoxi/column${/\/#\//.test(urlStr) ? `/${urlStr.split('/').pop()}` : ''}`;
                },
            },
        ],
    },
};
