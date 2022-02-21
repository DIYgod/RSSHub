module.exports = {
    'medsci.cn': {
        _name: '梅斯医学',
        '.': [
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/new-media.html#mei-si-yi-xue-zi-xun',
                source: ['/department/details', '/'],
                target: (params) => `/medsci${params.s_id ? `/${params.s_id}${params.t_id ? `/${params.s_id}` : ''}` : ''}`,
            },
        ],
    },
};
