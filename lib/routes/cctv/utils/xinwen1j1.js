const got = require('@/utils/got');
const cheerio = require('cheerio');
//
// 测试http://localhost:1200/cctv/xinwen1j1

// 完整文章页
async function load(link) {
    const res = await got({ method: 'get', url: link });
    const $ = cheerio.load(res.data);
    // console.log($('div.image').get().text())
    // console.log('********')
    const js_txt = '' + $('script');

    const guid = js_txt.split('guid_Ad_VideoCode = "')[1].split('";')[0];
    // console.log(guid+' js_txt********')
    const { data: videoDetail } = await got({
        method: 'get',
        url: `http://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid=${guid}`,
    });

    // poster="?" 以后再弄
    // <video src="${videoDetail.hls_url}" controls="controls"  poster="?"  style="width: 100%"></video>
    const description = `<video src="${videoDetail.hls_url}" controls="controls"  style="width: 100%"></video>`;

    // 提取内容
    return { description };
}

// 同步 列表
const ProcessFeed = (list, caches) =>
    Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a').text();
            const itemUrl = $('a').attr('href').split('?')[0];
            const itemDate = new Date(itemUrl.split('/VI')[0].split('com/')[1]).toUTCString();

            // 列表上提取到的信息
            const single = {
                title,
                link: itemUrl,
                author: '央视新闻',
                guid: itemUrl,
                pubDate: itemDate,
            };

            // 使用tryGet方法从缓存获取内容。
            // 当缓存中无法获取到链接内容的时候，则使用load方法加载文章内容。
            const other = await caches.tryGet(itemUrl, () => load(itemUrl));

            // 合并解析后的结果集作为该篇文章最终的输出结果
            return Promise.resolve(Object.assign({}, single, other));
        })
    );
module.exports = async (category, ctx) => {
    const baseUrl = 'http://tv.cctv.com/lm/xinwen1j1/videoset/index.shtml';
    // 获取要处理的页面
    const res = await got({ method: 'get', url: baseUrl });

    const $ = cheerio.load(res.data);

    let list = $('div.text').slice(0, 30); // 取前30个
    // $('div.image').slice(0,3).find('img').attr('src')
    // $('div.image').slice(0,3).find('a').attr('href').split('?')[0]

    list = list.get();

    // 处理所有的页面
    const result = await ProcessFeed(list, ctx.cache);

    return {
        title: '《新闻1+1》- 中央电视台新闻频道',
        link: baseUrl,
        description:
            '《新闻1+1》是中央电视台新闻频道的一档访谈类栏目。周一至周五，从时事政策、公共话题、突发事件等大型选题中选取当天最新、最热、最快的新闻话题，还原新闻全貌、解读事件真相，力求以精度、纯度和锐度为新闻导向，呈现最质朴的新闻。首播：CCTV-新闻：周一至周五21:30—21:55；重播：次日01:30，04:30。',
        item: result,
    };
};
