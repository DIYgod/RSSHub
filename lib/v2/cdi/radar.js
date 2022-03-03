module.exports = {
    'cdi.com.cn': {
        _name: '国家高端智库 / 综合开发研究院',
        '.': [
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/new-media.html#guo-jia-gao-duan-zhi-ku-zong-he-kai-fa-yan-jiu-yuan',
                source: ['/Article/List', '/'],
                target: (params, url) => `/cdi/${new URL(url).searchParams.get('ColumnId')}`,
            },
        ],
    },
};
