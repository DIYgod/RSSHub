export default {
    'chinathinktanks.org.cn': {
        _name: '中国智库网',
        www: [
            {
                title: '观点与实践',
                docs: 'https://docs.rsshub.app/routes/study#zhong-guo-zhi-ku-wang',
                source: '/',
                target: (params, url) => `/chinathinktanks/${new URL(url).searchParams.get('id')}`,
            },
        ],
    },
};
