module.exports = {
    'shmtu.edu.cn': {
        _name: '上海海事大学',
        jwc: [
            {
                title: '教务信息',
                docs: 'https://docs.rsshub.app/university.html#shang-hai-dian-li-da-xue',
                source: ['/:type'],
                target: '/shmtu/jwc/:type',
            },
        ],
        www: [
            {
                title: '官网信息',
                docs: 'https://docs.rsshub.app/university.html#shang-hai-dian-li-da-xue',
                source: ['/:type'],
                target: '/shmtu/www/:type',
            },
        ],
    },
};
