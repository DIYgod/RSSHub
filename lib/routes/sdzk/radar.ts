export default {
    'sdzk.cn': {
        _name: '山东省教育招生考试院',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/study#shan-dong-sheng-jiao-yu-zhao-sheng-kao-shi-yuan-xin-wen',
                source: ['/NewsList.aspx', '/'],
                target: (params, url) => {
                    const bcid = new URL(url).searchParams.get('BCID');
                    const cid = new URL(url).searchParams.get('CID');
                    return `/sdzk${bcid ? `/${bcid}${cid ? `/${cid}` : ''}` : ''}`;
                },
            },
        ],
    },
};
