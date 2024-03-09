export default {
    'nenu.edu.cn': {
        _name: '东北师范大学',
        sohac: [
            {
                title: '历史文化学院',
                docs: 'https://docs.rsshub.app/routes/university#dong-bei-shi-fan-da-xue-li-shi-wen-hua-xue-yuan',
                source: ['/index/xyxx.htm', '/index/tzgg.htm', '/'],
                target: (params, url) => `/nenu/sohac${new URL(url).href.match(/\.edu\.cn(.*?)\.htm/)[1]}`,
            },
        ],
        yjsy: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/routes/university#dong-bei-shi-fan-da-xue-yan-jiu-sheng-yuan',
                source: ['/tzgg.htm', '/'],
                target: (params, url) => `/nenu/yjsy${new URL(url).href.match(/\.edu\.cn(.*?)\.htm/)[1]}`,
            },
        ],
    },
};
