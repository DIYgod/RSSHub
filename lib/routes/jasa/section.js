const cheerio = require('cheerio');
const currentUrl = 'https://asa.scitation.org/toc/jas/current';

const idMap = {
    reflections: {
        name: 'REFLECTIONS',
        section: 'REFLECTIONS',
    },
    animal: {
        name: 'ANIMAL BIOACOUSTICS',
        section: 'ANIMAL+BIOACOUSTICS',
    },
    computational: {
        name: 'COMPUTATIONAL ACOUSTICS',
        section: 'COMPUTATIONAL+ACOUSTICS',
    },
    engineering: {
        name: 'ENGINEERING ACOUSTICS',
        section: 'ENGINEERING+ACOUSTICS',
    },
    musical: {
        name: 'MUSICAL ACOUSTICS',
        section: 'MUSICAL+ACOUSTICS',
    },
    noise: {
        name: 'NOISE',
        section: 'NOISE',
    },
    physical: {
        name: 'PHYSICAL ACOUSTICS',
        section: 'PHYSICAL+ACOUSTICS',
    },
    psychological: {
        name: 'PSYCHOLOGICAL AND PHYSIOLOGICAL ACOUSTICS',
        section: 'PSYCHOLOGICAL+AND+PHYSIOLOGICAL+ACOUSTICS',
    },
    signalprocessing: {
        name: 'SIGNAL PROCESSING IN ACOUSTICS',
        section: 'SIGNAL+PROCESSING+IN+ACOUSTICS',
    },
    speech: {
        name: 'SPEECH COMMUNICATION',
        section: 'SPEECH+COMMUNICATION',
    },
    underwater: {
        name: 'UNDERWATER ACOUSTICS',
        section: 'UNDERWATER+ACOUSTICS',
    },
    letters: {
        name: 'LETTERS TO THE EDITOR',
        section: 'LETTERS+TO+THE+EDITOR',
    },
    errata: {
        name: 'ERRATA',
        section: 'ERRATA',
    },
    standardsnews: {
        name: 'ACOUSTICAL STANDARDS NEWS',
        section: 'ACOUSTICAL+STANDARDS+NEWS',
    },
    reviewspatents: {
        name: 'REVIEWS OF ACOUSTICAL PATENTS',
        section: 'REVIEWS+OF+ACOUSTICAL+PATENTS',
    },
};

module.exports = async (ctx) => {
    const id = ctx.params.id || 'animal';
    const baseUrl = await ctx.cache.tryGet(
        currentUrl,
        async () => {
            // 使用 puppeteer 渲染页面获取
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();

            await page.goto(currentUrl);
            const currentHtml = await page.evaluate(
                () =>
                    // eslint-disable-next-line no-undef
                    document.querySelector('h4.issue-header.visible-sm.visible-md.visible-lg').innerHTML
            );
            const currentCache = cheerio.load(currentHtml);
            const volume = currentCache
                .text()
                .replace(/[ ]|[\r\n]/g, '')
                .split(',')[0]
                .substring(6);
            const issue = currentCache
                .text()
                .replace(/[ ]|[\r\n]/g, '')
                .split(',')[1]
                .substring(5);
            const baseUrl = 'https://asa.scitation.org/toc/jas/' + volume + '/' + issue + '?tocSection=';
            browser.close();
            return baseUrl;
        },
        8 * 60 * 60
    ); // 防止访问频率过高

    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();

    await page.goto(baseUrl + idMap[id].section);
    const htmlCache = await page.evaluate(
        () =>
            document.querySelector('div.sub-section').innerHTML
    );
    browser.close();

    const $ = cheerio.load(htmlCache);
    const list = $('section.card');

    $.fn.immediateText = function () {
        return this.contents().not(this.children()).text();
    };

    ctx.state.data = {
        title: 'JASA - ' + idMap[id].name,
        link: currentUrl,
        item:
            list &&
            list
                .map((index, item) => ({
                    title: $(item).find('h4.hlFld-Title').text(),
                    author: $(item).find('div.entryAuthor.all').text(),
                    description: $(item).find('h4.hlFld-Title').text() + '<br><br>' + $(item).find('div.entryAuthor.all').text() + '<br><br>' + $(item).find('div.open-access.item-access').immediateText(),
                    pubDate: $(item).find('div.open-access.item-access').immediateText(),
                    link: $(item).find('a.ref.nowrap').attr('href'),
                }))
                .get(),
    };
};
