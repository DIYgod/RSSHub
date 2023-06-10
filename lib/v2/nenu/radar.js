module.exports = {
    'nenu.edu.cn': {
        _name: '东北师范大学',
        yjsy: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/university.html#dong-bei-shi-fan-da-xue-yan-jiu-sheng-yuan',
                source: ['/tzgg.htm', '/'],
                target: (params, url) => `/nenu/yjsy${new URL(url).href.match(/\.edu\.cn(.*?)\.htm/)[1]}`,
            },
        ],
    },
};
