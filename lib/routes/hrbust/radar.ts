export default {
    'hrbust.edu.cn': {
        _name: '哈尔滨理工大学',
        jwzx: [
            {
                title: '教务处',
                docs: 'https://docs.rsshub.app/routes/university#ha-er-bin-li-gong-da-xue',
                source: '/homepage/*',
                target: (params, url) => `/hrbust/jwzx/${new URL(url).searchParams.get('columnId')}`,
            },
        ],
    },
};
