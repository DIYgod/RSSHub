export default {
    'shmeea.edu.cn': {
        _name: '上海市教育考试院',
        www: [
            {
                title: '消息',
                docs: 'https://docs.rsshub.app/routes/study#shang-hai-shi-jiao-yu-kao-shi-yuan',
                source: ['/page/:id?/index.html'],
                target: (params, url, document) => {
                    const li = document.querySelector('#main .pageList li');
                    return li ? '/shmeea/:id?' : '';
                },
            },
            {
                title: '自学考试通知公告',
                docs: 'https://docs.rsshub.app/routes/study#shang-hai-shi-jiao-yu-kao-shi-yuan',
                source: ['/page/04000/index.html', '/'],
                target: '/shmeea/self-study',
            },
        ],
    },
};
