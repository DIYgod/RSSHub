export default {
    'zhitongcaijing.com': {
        _name: '智通财经',
        '.': [
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/routes/finance#zhi-tong-cai-jing-zi-xun',
                source: ['/:category', '/'],
                target: (params, url) => {
                    const id = new URL(url).toString().match(/\/(\w+)\.html/)[1];
                    const category = new URL(url).searchParams.get('category_key');
                    return `/zhitongcaijing/${id}${category ? `/${category}` : ''}`;
                },
            },
        ],
    },
};
