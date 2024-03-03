export default {
    'acpaa.cn': {
        _name: '中华全国专利代理师协会',
        '.': [
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/routes/other#zhong-hua-quan-guo-zhuan-li-dai-li-shi-xie-hui',
                source: ['/article/taglist.jhtml'],
                target: (url) => {
                    url = new URL(url);
                    const id = url.searchParams.get('id');
                    const name = url.searchParams.get('name');

                    return `/acpaa${id ? `/${id}${name ? `/${name}` : ''}` : ''}`;
                },
            },
        ],
    },
};
