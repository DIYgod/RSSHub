export default {
    'sspu.edu.cn': {
        _name: '上海第二工业大学',
        jwc: [
            {
                title: '教务处',
                docs: 'https://docs.rsshub.app/university#shang-hai-di-er-gong-ye-da-xue',
                source: ['/jwc/:listId/list.htm'],
                target: '/sspu/jwc/:listId',
            },
        ],
        pe2016: [
            {
                title: '体育部',
                docs: 'https://docs.rsshub.app/university#shang-hai-di-er-gong-ye-da-xue-ti-yu-bu',
                source: ['/:id/list.htm'],
                target: '/sspu/pe/:id',
            },
        ],
    },
};
