export default {
    'cfmmc.com': {
        _name: '中国期货市场监控中心',
        '.': [
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/routes/finance#zhong-guo-qi-huo-shi-chang-jian-kong-zhong-xin-lan-mu',
                source: ['/:id*'],
                target: (params) => {
                    const id = params.id.replace(/\/index\.shtml/, '');

                    return `/cfmmc${id ? `/${id}` : ''}`;
                },
            },
        ],
    },
};
