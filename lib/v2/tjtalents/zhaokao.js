const got = require('@/utils/got');
module.exports = async (ctx) => {
    const APIUrl = `https://www.tjtalents.com.cn/app/article/newArticleAction!getzxList.do`;
    const detailUrl = `https://www.tjtalents.com.cn/app/beifang/ttscAction!gettzggList1.do`;
    var items = []
    var count = 1
    console.log(ctx.params.page)
    do {
        const response = await got
            .post(APIUrl, {
                form: {
                    currentPage: count,
                    cate_id: 3013
                },
            })
            .json();

        const data = response['articlelist']
        for (var j = 0; j < data.length; j++) {
            const response = await got
                .post(detailUrl, {
                    form: {
                        currentPage: count,
                        zxid: parseInt(data[j]['zxid'])
                    },
                })
                .json();
            var sjap = ""
            for (var i = 0; i < response['sjapcount']; i++) {
                sjap += response['sjaplist'][i]['nr']+'<br>'
            }
            items.push({
                title: data[j]['zxmc'],
                description: sjap,
                pubDate: data[j]['fbrq'],
                link: `https://www.tjtalents.com.cn/app/beifang/${data[j]['zxid']}.shtml`,
            })

        }
        count++
        console.log("count次数为:"+count)
    }
    while (count < ctx.params.page+1 ?? 6 )

    ctx.state.data = {
        allowEmpty: true,
        title: `北方人才网招考公告`,
        link: `https://www.tjtalents.com.cn/app/article/list/3013.shtml`,
        item: items,
    };
}


