export default {
    'nifd.cn': {
        _name: '国家金融与发展实验室',
        www: [
            {
                title: '周报',
                docs: 'https://docs.rsshub.app/routes/finance#guo-jia-jin-rong-yu-fa-zhan-shi-yan-shi-yan-jiu',
                source: ['/Research'],
                target: (_, url) => {
                    const categoryGuid = new URL(url).searchParams.get('categoryGuid');
                    if (categoryGuid === '7a6a826d-b525-42aa-b550-4236e524227f') {
                        return `/nifd/research/${categoryGuid}`;
                    }
                },
            },
            {
                title: '双周刊',
                docs: 'https://docs.rsshub.app/routes/finance#guo-jia-jin-rong-yu-fa-zhan-shi-yan-shi-yan-jiu',
                source: ['/Research'],
                target: (_, url) => {
                    const categoryGuid = new URL(url).searchParams.get('categoryGuid');
                    if (categoryGuid === '128d602c-7041-4546-beff-83e605f8a370') {
                        return `/nifd/research/${categoryGuid}`;
                    }
                },
            },
            {
                title: '月报',
                docs: 'https://docs.rsshub.app/routes/finance#guo-jia-jin-rong-yu-fa-zhan-shi-yan-shi-yan-jiu',
                source: ['/Research'],
                target: (_, url) => {
                    const categoryGuid = new URL(url).searchParams.get('categoryGuid');
                    if (categoryGuid === '0712e220-fa3b-44d4-9226-bc3d57944e19') {
                        return `/nifd/research/${categoryGuid}`;
                    }
                },
            },
            {
                title: '季报',
                docs: 'https://docs.rsshub.app/routes/finance#guo-jia-jin-rong-yu-fa-zhan-shi-yan-shi-yan-jiu',
                source: ['/Research'],
                target: (_, url) => {
                    const categoryGuid = new URL(url).searchParams.get('categoryGuid');
                    if (categoryGuid === 'b66aa691-87ee-4bfe-ac6b-2460386166ee') {
                        return `/nifd/research/${categoryGuid}`;
                    }
                },
            },
            {
                title: '年报',
                docs: 'https://docs.rsshub.app/routes/finance#guo-jia-jin-rong-yu-fa-zhan-shi-yan-shi-yan-jiu',
                source: ['/Research'],
                target: (_, url) => {
                    const categoryGuid = new URL(url).searchParams.get('categoryGuid');
                    if (categoryGuid === 'c714853a-f09e-4510-8835-30a448fff7e3') {
                        return `/nifd/research/${categoryGuid}`;
                    }
                },
            },
            {
                title: '课题报告',
                docs: 'https://docs.rsshub.app/routes/finance#guo-jia-jin-rong-yu-fa-zhan-shi-yan-shi-yan-jiu',
                source: ['/Research'],
                target: (_, url) => {
                    const categoryGuid = new URL(url).searchParams.get('categoryGuid');
                    if (categoryGuid === '17d0b29b-7912-498a-b9c3-d30508220158') {
                        return `/nifd/research/${categoryGuid}`;
                    }
                },
            },
            {
                title: '学术论文',
                docs: 'https://docs.rsshub.app/routes/finance#guo-jia-jin-rong-yu-fa-zhan-shi-yan-shi-yan-jiu',
                source: ['/Research'],
                target: (_, url) => {
                    const categoryGuid = new URL(url).searchParams.get('categoryGuid');
                    if (categoryGuid === 'e6a6d3a5-4bda-4739-9765-e4e41c900bcc') {
                        return `/nifd/research/${categoryGuid}`;
                    }
                },
            },
            {
                title: '工作论文',
                docs: 'https://docs.rsshub.app/routes/finance#guo-jia-jin-rong-yu-fa-zhan-shi-yan-shi-yan-jiu',
                source: ['/Research'],
                target: (_, url) => {
                    const categoryGuid = new URL(url).searchParams.get('categoryGuid');
                    if (categoryGuid === '3d23ba0e-4f46-44c2-9d21-6b38df4cdd70') {
                        return `/nifd/research/${categoryGuid}`;
                    }
                },
            },
            {
                title: '研究评论',
                docs: 'https://docs.rsshub.app/routes/finance#guo-jia-jin-rong-yu-fa-zhan-shi-yan-shi-yan-jiu',
                source: ['/Research'],
                target: (_, url) => {
                    const categoryGuid = new URL(url).searchParams.get('categoryGuid');
                    if (categoryGuid === '3333d2af-91d6-429b-be83-28b92f31b6d7') {
                        return `/nifd/research/${categoryGuid}`;
                    }
                },
            },
            {
                title: '其他报告',
                docs: 'https://docs.rsshub.app/routes/finance#guo-jia-jin-rong-yu-fa-zhan-shi-yan-shi-yan-jiu',
                source: ['/Research'],
                target: (_, url) => {
                    const categoryGuid = new URL(url).searchParams.get('categoryGuid');
                    if (categoryGuid === '6363bdc7-3e1b-4771-a904-6162cd3a3143') {
                        return `/nifd/research/${categoryGuid}`;
                    }
                },
            },
        ],
    },
};
