export default {
    'chinaisa.org.cn': {
        _name: '中国钢铁工业协会',
        '.': [
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/routes/new-media#zhong-guo-gang-tie-gong-ye-xie-hui-lan-mu',
                source: ['/gxportal/xfgl/portal/list.html'],
                target: (params, url) => {
                    url = new URL(url);
                    const columnId = url.searchParams.get('columnId');

                    return `/chinaisa${columnId ? `/${columnId}` : ''}`;
                },
            },
        ],
    },
};
