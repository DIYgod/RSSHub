module.exports = {
    'leetcode.com': {
        _name: 'LeetCode',
        '.': [
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/programming.html#leetcode',
                source: ['/articles'],
                target: '/leetcode/articles',
            },
            {
                title: '打卡',
                docs: 'https://docs.rsshub.app/programming.html#leetcode',
                source: ['/:user'],
                target: (params) => {
                    if (params.user !== 'articles') {
                        return `/leetcode/submission/us/:user`;
                    }
                },
            },
            {
                title: '每日一题',
                docs: 'https://docs.rsshub.app/programming.html#leetcode',
                source: ['/'],
                target: '/leetcode/dailyquestion/en',
            },
            {
                title: '每日一题题解',
                docs: 'https://docs.rsshub.app/programming.html#leetcode',
                source: ['/'],
                target: '/leetcode/dailyquestion/solution/en',
            },
        ],
    },
    'leetcode.cn': {
        _name: 'LeetCode',
        '.': [
            {
                title: '打卡',
                docs: 'https://docs.rsshub.app/programming.html#leetcode',
                source: ['/:user'],
                target: (params) => {
                    if (params.user !== 'articles') {
                        return `/leetcode/submission/cn/:user`;
                    }
                },
            },
            {
                title: '每日一题',
                docs: 'https://docs.rsshub.app/programming.html#leetcode',
                source: ['/'],
                target: '/leetcode/dailyquestion/cn',
            },
            {
                title: '每日一题题解',
                docs: 'https://docs.rsshub.app/programming.html#leetcode',
                source: ['/'],
                target: '/leetcode/dailyquestion/solution/cn',
            },
        ],
    },
};
