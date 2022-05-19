module.exports = {
    'youzhiyouxing.cn': {
        _name: '有知有行',
        '.': [
            {
                title: '有知 - 全部',
                docs: 'https://docs.rsshub.app/finance.html#you-you-wei-zhi-zhi-you-you-wei-xing-hang-xing-hang-heng-you-you-wei-zhi-zhi-wen-zhang-zhang',
                source: ['/materials'],
                target: '/youzhiyouxing/materials',
            },
            {
                title: '有知 - 知行小酒馆',
                docs: 'https://docs.rsshub.app/finance.html#you-you-wei-zhi-zhi-you-you-wei-xing-hang-xing-hang-heng-you-you-wei-zhi-zhi-wen-zhang-zhang',
                source: ['/materials'],
                target: (_params, url) => {
                    if (new URL(url).searchParams.get('column_id') === '4') {
                        return '/youzhiyouxing/materials/4';
                    }
                },
            },
            {
                title: '有知 - 知行黑板报',
                docs: 'https://docs.rsshub.app/finance.html#you-you-wei-zhi-zhi-you-you-wei-xing-hang-xing-hang-heng-you-you-wei-zhi-zhi-wen-zhang-zhang',
                source: ['/materials'],
                target: (_params, url) => {
                    if (new URL(url).searchParams.get('column_id') === '2') {
                        return '/youzhiyouxing/materials/2';
                    }
                },
            },
            {
                title: '有知 - 无人知晓',
                docs: 'https://docs.rsshub.app/finance.html#you-you-wei-zhi-zhi-you-you-wei-xing-hang-xing-hang-heng-you-you-wei-zhi-zhi-wen-zhang-zhang',
                source: ['/materials'],
                target: (_params, url) => {
                    if (new URL(url).searchParams.get('column_id') === '10') {
                        return '/youzhiyouxing/materials/10';
                    }
                },
            },
            {
                title: '有知 - 孟岩专栏',
                docs: 'https://docs.rsshub.app/finance.html#you-you-wei-zhi-zhi-you-you-wei-xing-hang-xing-hang-heng-you-you-wei-zhi-zhi-wen-zhang-zhang',
                source: ['/materials'],
                target: (_params, url) => {
                    if (new URL(url).searchParams.get('column_id') === '1') {
                        return '/youzhiyouxing/materials/1';
                    }
                },
            },
            {
                title: '有知 - 知行读书会',
                docs: 'https://docs.rsshub.app/finance.html#you-you-wei-zhi-zhi-you-you-wei-xing-hang-xing-hang-heng-you-you-wei-zhi-zhi-wen-zhang-zhang',
                source: ['/materials'],
                target: (_params, url) => {
                    if (new URL(url).searchParams.get('column_id') === '3') {
                        return '/youzhiyouxing/materials/3';
                    }
                },
            },
            {
                title: '有知 - 你好，同路人',
                docs: 'https://docs.rsshub.app/finance.html#you-you-wei-zhi-zhi-you-you-wei-xing-hang-xing-hang-heng-you-you-wei-zhi-zhi-wen-zhang-zhang',
                source: ['/materials'],
                target: (_params, url) => {
                    if (new URL(url).searchParams.get('column_id') === '11') {
                        return '/youzhiyouxing/materials/11';
                    }
                },
            },
        ],
    },
};
