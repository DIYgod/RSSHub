const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const md = require('markdown-it')({
    html: true,
    linkify: true,
});

const requestImages = (url, tryGet) =>
    tryGet(url, async () => {
        const response = await got({
            method: 'get',
            url,
        });

        const images = {};
        const boms = [];

        const imgData = response.data;
        imgData?.result?.boards?.forEach((board) => {
            const name = board.name;
            if (images[name] === undefined) {
                images[name] = [];
            }

            board.schematic?.documents?.forEach((val) => {
                if (val.thumb) {
                    images[name].push(val.thumb);
                }
            });

            if (board.pcb_info?.thumb) {
                images[name].push(board.pcb_info.thumb);
            }
            if (board.pcb_info?.boms?.boms) {
                boms.push(...JSON.parse(board.pcb_info.boms.boms));
            }
        });
        return { images, boms };
    });

module.exports = async (ctx) => {
    const baseUrl = 'https://oshwhub.com';
    const sortType = ctx.params.sortType ?? 'updatedTime';

    const url = `${baseUrl}/explore?projectSort=${sortType}`;
    const response = await got({
        method: 'get',
        url,
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const title = $('title').text();
    const projects = $('a[class="project-link"]');

    const items = await Promise.all(
        projects.map((id, item) => {
            const detailUrl = `${baseUrl}${item.attribs.href}`;
            return ctx.cache.tryGet(detailUrl, async () => {
                const response = await got({
                    method: 'get',
                    url: detailUrl,
                });

                const html = response.data;
                const $$ = cheerio.load(html);
                const projectDetail = $$('div[class="projects-left-top"]');

                const title = $$(projectDetail).find('span[class="title"]').text();
                const author = $$(projectDetail).find('div[class="member-items"] > ul > li > a > span').first().text().trim();
                const publishTime = $$(projectDetail).find('div[class="issue-time"] > span').text();
                const pubDate = timezone(parseDate(publishTime.trim().split('\n')[1].trim(), 'YYYY/MM/DD HH:mm:ss'), 0);

                const coverImg = $$(projectDetail).find('div[class="img-cover"] > img').attr('src').trim();
                const introduction = $$(projectDetail).find('p[class="introduction"]').text().trim();
                const content = $$(projectDetail).find('div[class*="html-content"]').attr('data-markdown');

                // request images
                const dataUuid = $$('div[class="projects-detail"]').attr()['data-uuid'];
                const { images, boms } = await requestImages(`${baseUrl}/api/project/${dataUuid}/pro_images`, ctx.cache.tryGet);

                const description = art(path.join(__dirname, 'templates/description.art'), {
                    title,
                    author,
                    publishTime,
                    coverImg,
                    introduction,
                    content: md.render(content) || 'No Content',
                    images,
                    boms,
                });

                const single = {
                    title,
                    description,
                    pubDate,
                    link: detailUrl,
                    author,
                };

                return single;
            });
        })
    );

    ctx.state.data = {
        title,
        link: url,
        description: title,
        item: items,
    };
};
