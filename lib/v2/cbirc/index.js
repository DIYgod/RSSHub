const got = require('@/utils/got');

const categories = {
    jgdt: {
        baseUrl: `http://www.cbirc.gov.cn`,
        description: '监管动态',
        link: `http://www.cbirc.gov.cn/cn/static/data/DocInfo/SelectDocByItemIdAndChild/data_itemId=915,pageIndex=1,pageSize=18.json`,
        title: '监管动态',
    },
    ggtz: {
        baseUrl: `http://www.cbirc.gov.cn`,
        description: '公告通知',
        link: `http://www.cbirc.gov.cn/cn/static/data/DocInfo/SelectDocByItemIdAndChild/data_itemId=925,pageIndex=1,pageSize=18.json`,
        title: '公告通知',
    },
    zcfg: {
        baseUrl: `http://www.cbirc.gov.cn`,
        description: '政策法规',
        link: `http://www.cbirc.gov.cn/cn/static/data/DocInfo/SelectDocByItemIdAndChild/data_itemId=926,pageIndex=1,pageSize=18.json`,
        title: '政策法规',
    },
    zcjd: {
        baseUrl: `http://www.cbirc.gov.cn`,
        description: '政策解读',
        link: `http://www.cbirc.gov.cn/cn/static/data/DocInfo/SelectDocByItemIdAndChild/data_itemId=916,pageIndex=1,pageSize=18.json`,
        title: '政策解读',
    },
    zqyj: {
        baseUrl: `http://www.cbirc.gov.cn`,
        description: '征求意见',
        link: `http://www.cbirc.gov.cn/cn/static/data/DocInfo/SelectDocByItemIdAndChild/data_itemId=951,pageIndex=1,pageSize=18.json`,
        title: '征求意见',
    },
    xzxk: {
        baseUrl: `http://www.cbirc.gov.cn`,
        description: '行政许可',
        link: `http://www.cbirc.gov.cn/cn/static/data/DocInfo/SelectDocByItemIdAndChild/data_itemId=930,pageIndex=1,pageSize=18.json`,
        title: '行政许可',
    },
    xzcf: {
        baseUrl: `http://www.cbirc.gov.cn`,
        description: '行政处罚',
        link: `http://www.cbirc.gov.cn/cn/static/data/DocInfo/SelectDocByItemIdAndChild/data_itemId=931,pageIndex=1,pageSize=18.json`,
        title: '行政处罚',
    },
    xzjgcs: {
        baseUrl: `http://www.cbirc.gov.cn`,
        description: '行政监管措施',
        link: `http://www.cbirc.gov.cn/cn/static/data/DocInfo/SelectDocByItemIdAndChild/data_itemId=932,pageIndex=1,pageSize=18.json`,
        title: '行政监管措施',
    },
    gzlw: {
        baseUrl: `http://www.cbirc.gov.cn`,
        description: '工作论文',
        link: `http://www.cbirc.gov.cn/cn/static/data/DocInfo/SelectDocByItemIdAndChild/data_itemId=934,pageIndex=1,pageSize=18.json`,
        title: '工作论文',
    },
    jrzgyj: {
        baseUrl: `http://www.cbirc.gov.cn`,
        description: '金融监管研究',
        link: `http://www.cbirc.gov.cn/cn/static/data/DocInfo/SelectDocByItemIdAndChild/data_itemId=935,pageIndex=1,pageSize=18.json`,
        title: '金融监管研究',
    },
    tjxx: {
        baseUrl: `http://www.cbirc.gov.cn`,
        description: '统计信息',
        link: `http://www.cbirc.gov.cn/cn/static/data/DocInfo/SelectDocByItemIdAndChild/data_itemId=954,pageIndex=1,pageSize=18.json`,
        title: '统计信息',
    },
};

async function getContent(item) {
    const response = await got({
        method: 'get',
        url: 'http://www.cbirc.gov.cn/cn/static/data/DocInfo/SelectByDocId/data_docId=' + item.docId + '.json',
    });
    return response.data.data.docClob;
}

module.exports = async (ctx) => {
    const category = ctx.params.category ?? 'ggtz';
    const cat = categories[category];

    // 请求集合
    const response = await ctx.cache.tryGet(cat.link, async () => {
        const resp = await got({
            method: 'get',
            url: cat.link,
            headers: {
                Referer: `http://www.cbirc.gov.cn`,
            },
        });
        return resp.data;
    });

    // 遍历数据集合
    const dataLs = await Promise.all(
        response.data.rows.map(async (item) => {
            const content = await getContent(item);
            return {
                title: item.docTitle,
                // 文章正文
                description: content,
                // 文章发布时间
                pubDate: item.publishDate,
                // 文章链接
                link: `http://www.cbirc.gov.cn/cn/view/pages/ItemDetail.html?docId=${item.docId}&itemId=925&generaltype=0`,
            };
        })
    );

    ctx.state.data = {
        title: `中国银保监会-${cat.title}`,
        link: cat.link,
        description: `中国银保监会-${cat.title}`,
        item: dataLs,
        language: 'zh-CN',
    };
};
