export default {
    'tongli.com.tw': {
        _name: '東立出版社',
        '.': [
            {
                title: '新聞',
                docs: 'https://docs.rsshub.app/routes/reading#dong-li-chu-ban-she',
                source: ['/TNews_List.aspx'],
                target: (_param, url) => {
                    const searchParams = new URL(url).searchParams;
                    return searchParams.has('Type') ? `/tongli/news/${searchParams.get('Type')}` : null;
                },
            },
        ],
    },
};
