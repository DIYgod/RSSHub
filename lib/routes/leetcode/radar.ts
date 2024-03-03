export default {
    'leetcode.com': {
        _name: 'LeetCode',
        '.': [
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/routes/programming#leetcode',
                source: ['/articles'],
                target: '/leetcode/articles',
            },
            {
                title: '每日一题',
                docs: 'https://docs.rsshub.app/routes/programming#leetcode',
                source: ['/'],
                target: '/leetcode/dailyquestion/en',
            },
            {
                title: '每日一题题解',
                docs: 'https://docs.rsshub.app/routes/programming#leetcode',
                source: ['/'],
                target: '/leetcode/dailyquestion/solution/en',
            },
        ],
    },
    'leetcode.cn': {
        _name: 'LeetCode',
        '.': [
            {
                title: '每日一题',
                docs: 'https://docs.rsshub.app/routes/programming#leetcode',
                source: ['/'],
                target: '/leetcode/dailyquestion/cn',
            },
            {
                title: '每日一题题解',
                docs: 'https://docs.rsshub.app/routes/programming#leetcode',
                source: ['/'],
                target: '/leetcode/dailyquestion/solution/cn',
            },
        ],
    },
};
