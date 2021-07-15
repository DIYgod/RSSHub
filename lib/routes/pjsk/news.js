const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const {parseDate} = require('@/utils/parse-date');
const chrome = require('@/utils/puppeteer');
module.exports = async (ctx) => {
    // 从仓库 Sekai-World/sekai-master-db-diff 获取最新公告
    const response = await got.get(`https://raw.githubusercontent.com/Sekai-World/sekai-master-db-diff/master/userInformations.json`);
    const posts = response.data || [];
    const browser = await chrome();
    const list = await Promise.all(
        posts.map(async (post) => {
            let link = '';
            let description = '';
            const guid = post.displayOrder.toString() + post.id.toString(); // 双ID
            if (post.path.startsWith("information/")) {
                // information 公告
                link = `https://production-web.sekai.colorfulpalette.org/${post.path}`;
                // 打开网页
                const page = await browser.newPage();
                await page.goto(link);
                const html = await page.evaluate(
                    () => document.querySelector('section').innerHTML
                );
                description = html;
                page.close();
            } else {
                // 外链
                link = post.path;
                description = post.title;
            }

            const item = {
                title: post.title,
                link: link,
                pubDate: timezone(parseDate(post.startAt)), // +8时区
                description: description,
                category: post.informationTag, // event,gacha,music,bug,information
                guid: guid
            };
            return Promise.resolve(item);
        })
    );
    browser.close();
    ctx.state.data = {
        title: 'Project Sekai - News',
        link: 'https://pjsekai.sega.jp/',
        description: 'プロジェクトセカイ カラフルステージ！ feat.初音ミク',
        item: list,
    };
};
