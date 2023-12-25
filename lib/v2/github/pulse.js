const cheerio = require('cheerio');
const path = require('path');
const got = require('@/utils/got');
const md5 = require('@/utils/md5');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');

module.exports = async (ctx) => {
    const { user, repo, period } = ctx.params;

    const periods = ['daily', 'halfweekly', 'weekly', 'monthly'];
    const pulsePeriod = periods.includes(period) ? period : periods[2];

    const link = `https://github.com/${user}/${repo}/pulse/${pulsePeriod}`;
    const { data: pulsePage } = await got(link);
    const $ = cheerio.load(pulsePage);

    const $mainSections = $('main .Layout-main').children();

    const $subheading = $mainSections.eq(0);
    const [periodFrom, periodTo] = $subheading.find('h2').text().split('–');

    const $overview = $mainSections.eq(1);
    const overviewItems = $overview
        .find('ul ul li')
        .map((_, el) => $(el).text())
        .toArray();

    const $commitActivity = $mainSections.eq(2);
    let commitActivity;
    const $contributionData = $commitActivity.find('.js-pulse-contribution-data');
    if ($contributionData.length) {
        const summaryUrl = $contributionData.attr('data-pulse-diffstat-summary-url');
        commitActivity = (await got(`https://github.com${summaryUrl}`)).data;
    } else {
        commitActivity = $commitActivity.text();
    }

    const $githubActivity = $mainSections.eq(3);
    let githubActivity;
    const $sections = $githubActivity.find('h3');
    if ($sections.length) {
        githubActivity = $sections
            .map((_, section) => {
                const $section = $(section);
                const $sectionSiblings = $section.nextUntil('h3');
                const $paragraph = $section.nextUntil('ul');
                const $list = $sectionSiblings.last();
                return {
                    heading: $section.text(),
                    paragraph: $paragraph.length > 0 ? $paragraph.text() : undefined,
                    items: $list
                        .children()
                        .map((_, item) => {
                            const $item = $(item);
                            const $link = $item.find('a');
                            const $details = $item.find('p');
                            const $relativeTime = $details.find('relative-time');
                            $relativeTime.replaceWith($relativeTime.attr('datetime'));
                            return {
                                link: { text: $link.text(), url: $link.attr('href') },
                                details: $details.text(),
                            };
                        })
                        .toArray(),
                };
            })
            .toArray();
    }

    ctx.state.data = {
        title: `${user}/${repo} ${pulsePeriod} Pulse`,
        link,
        item: [
            {
                guid: md5(`${user}${repo}${period}${periodFrom}${periodTo}`),
                title: `${periodFrom} - ${periodTo}`,
                description: art(path.join(__dirname, 'templates/pulse-description.art'), {
                    overviewItems,
                    commitActivity,
                    githubActivity,
                }),
                pubDate: parseDate(periodTo),
            },
        ],
    };
};
