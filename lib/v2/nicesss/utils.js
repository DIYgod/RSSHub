const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

function ParseImgs(html) {
    // 解析详情页的全部图片
    const $ = cheerio.load(html);

    return $('img.alignnone')
        .toArray()
        .map((img) => {
            const src = img.attribs['data-srcset'];
            const alt = img.attribs.alt;
            return { src, alt };
        });
}
function ParseDownloadLinks(html, defaultDrive) {
    // 解析详情页的全部下载链接
    const $ = cheerio.load(html);
    const links = $('center button a').toArray();

    return links.slice(0, Math.floor(links.length / 2)).map((link) => {
        const href = link.attribs.href;
        let text = '';
        if (href.includes('rosefile')) {
            text = 'RoseFile';
        } else if (href.includes('77file')) {
            text = '77File';
        } else if (href.includes('stfly') || href.includes('shrinkme') || href.includes('ouo.io') || href.includes('link1s')) {
            text = defaultDrive;
        } else {
            text = '未知下载方式';
        }

        return { href, text };
    });
}

module.exports = {
    ProcessItems: async (ctx, content) => {
        let items = content('div.row.posts-wrapper article') // 列表页数据，基本信息
            .toArray()
            .map((item) => {
                item = content(item);
                const link = item.find('a').first().attr('href');

                return {
                    title: item.find('h2').text(),
                    link,
                    pubDate: parseDate(item.find('time').attr('datetime')),
                    author: item.find('span.meta-category').first().text(),
                };
            });

        items = await Promise.all(
            // 获取详情页数据
            items.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const { data: detailResponse } = await got(item.link);
                    const content = cheerio.load(detailResponse);

                    const uploader = content('span.sjblog-name a').first();
                    const uploadDate = content('span.sjblog-time').first();
                    let metaInfos = [];

                    metaInfos = content('font') // 部分元信息
                        .toArray()
                        .map((info) => {
                            info = content(info);
                            return {
                                key: info
                                    .text()
                                    .split('：')[0]
                                    .replaceAll(/\[|]|-|[A-Za-z]/g, ''),
                                value: info.text().split('：')[1],
                            };
                        });
                    if (metaInfos.length === 0) {
                        metaInfos = [
                            { key: '解压密码', value: '未知密码' },
                            { key: '下载网盘', value: '未知网盘' },
                            { key: '图片像素', value: '未知' },
                            { key: '联系邮箱', value: '未知' },
                        ];
                    }
                    let tags = content('div.entry-tags').first();
                    tags = tags
                        .find('a')
                        .toArray()
                        .map((tag) => content(tag).text());
                    const imgs = ParseImgs(detailResponse); // 详情页，预览图列表
                    const downloadLinks = ParseDownloadLinks(detailResponse, metaInfos[1].value); // 详情页，下载链接列表

                    item.category = tags;
                    item.author = uploader.text();
                    // 如果downloadLinks中有defaultDrive的，将其设为item.enclosure_url
                    item.enclosure_url = downloadLinks.find((link) => link.text === metaInfos[1].value)?.href || '';
                    item.description = `
                    <ul>
                        <li>
                            <b>上传日期</b>：${uploadDate.text().split('：')[1]}
                        </li>
                        <li>
                            <b>上传者</b>: ${uploader.text()}
                        </li>
                        <li>
                            <b>类型</b>: ${item.author}
                        </li>
                        ${metaInfos.map((info) => `<li><b>${info.key}</b>: ${info.value}</li>`).join('')}
                        <li>
                            <b>下载链接</b>:
                            <ul>${downloadLinks.map((link) => `<li><a href="${link.href}">${link.text}</a></li>`).join('')}</ul>
                        </li>
                        <li>
                            <b>标签</b>:
                            <ul>${tags.map((tag) => `<li><a href="https://www.nicesss.com/archives/tag/${tag}">${tag}</a></li>`).join('')}</ul>
                        </li>
                    </ul>
                    <div>
                    ${imgs.map((img) => `<img src="${img.src}" alt="${img.alt}" /><br>`).join('')}
                    </div>`;

                    return item;
                })
            )
        );
        return items;
    },
};
