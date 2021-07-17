const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    ctx.state.data = {
        title: '该语雀 RSS 源已废弃',
        link: 'https://docs.rsshub.app/study.html#yu-que',
        description: '请参考最新配置方式重新配置',
        item: [
            {
                title: '该配置方式已废弃',
                description: '请参考语雀最新配置方式重新配置',
                pubDate: parseDate('2021/07/10', 'YYYY/MM/DD'),
                link: 'https://docs.rsshub.app/study.html#yu-que',
            },
        ],
    };
};
