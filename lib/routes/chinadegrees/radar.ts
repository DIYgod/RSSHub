export default {
    'chinadegrees.com.cn': {
        _name: '中华人民共和国学位证书查询',
        '.': [
            {
                title: '各学位授予单位学位证书上网进度',
                docs: 'https://docs.rsshub.app/routes/study#zhong-hua-ren-min-gong-he-guo-xue-wei-zheng-shu-cha-xun',
                source: ['/help/*province'],
                target: (params) => `/chinadegrees/${params.province.replace('unitSwqk', '').replace('.html', '')}`,
            },
        ],
    },
};
