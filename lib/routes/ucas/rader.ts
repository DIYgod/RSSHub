// @ts-nocheck
module.exports = {
    'ucas.ac.cn': {
        _name: '中国科学院大学招聘',
        zhaopin: [
            {
                title: '招聘信息-博士后',
                docs: 'https://docs.rsshub.app/university#zhong-guo-ke-xue-yuan-da-xue-zhao-pin-xin-xi',
                source: '/*',
                target: (params, url) => {
                    if (new URL(url).searchParams.get('c') === '6') {
                        return '/ucas/job/bsh';
                    }
                },
            },
            {
                title: '招聘信息-课题项目聘用',
                docs: 'https://docs.rsshub.app/university#zhong-guo-ke-xue-yuan-da-xue-zhao-pin-xin-xi',
                source: '/*',
                target: (params, url) => {
                    if (new URL(url).searchParams.get('c') === '5') {
                        return '/ucas/job/ktxmpy';
                    }
                },
            },
            {
                title: '招聘信息-管理支撑人才',
                docs: 'https://docs.rsshub.app/university#zhong-guo-ke-xue-yuan-da-xue-zhao-pin-xin-xi',
                source: '/*',
                target: (params, url) => {
                    if (new URL(url).searchParams.get('c') === '4') {
                        return '/ucas/job/glzcrc';
                    }
                },
            },
            {
                title: '招聘信息-科学科研人才',
                docs: 'https://docs.rsshub.app/university#zhong-guo-ke-xue-yuan-da-xue-zhao-pin-xin-xi',
                source: '/*',
                target: (params, url) => {
                    if (new URL(url).searchParams.get('c') === '3') {
                        return '/ucas/job/jxkyrc';
                    }
                },
            },
        ],
    },
};
