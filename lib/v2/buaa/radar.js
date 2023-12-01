module.exports = {
    'buaa.edu.cn': {
        _name: '北京航空航天大学',
        'www.sme': [
            {
                title: '集成电路科学与工程学院',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-hang-kong-hang-tian-da-xue-ji-cheng-dian-lu-ke-xue-yu-gong-cheng-xue-yuan',
                source: ['/'],
                target: (_, url) => `/buaa/sme${new URL(url).pathname.replace('.htm', '')}`,
            },
        ],
    },
};
