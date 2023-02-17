module.exports = {
    'hrbust.edu.cn': {
        _name: '哈尔滨理工大学',
        jwzx: [
            {
                title: '教务处',
                docs: 'https://docs.rsshub.app/university.html#ha-er-bin-li-gong-da-xue',
                source: '/homepage/*',
                target: (params, url) => `/hrbust/jwzx/${url.match(/(?<=columnId=)\d+/)}`,
            },
        ],
    },
};
