const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { id = '380' } = ctx.params;

    const author = '中国气象局·天气预报';
    const rootUrl = 'https://weather.cma.cn';
    const apiUrl = new URL('api/channel', rootUrl).href;
    const currentUrl = new URL(`web/channel-${id}.html`, rootUrl).href;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            id,
        },
    });

    const data = response?.data?.pop() ?? {};

    data.image = data.image?.replace(/\?.*$/, '') ?? undefined;

    const { data: currentResponse } = await got(currentUrl);

    const $ = cheerio.load(currentResponse);

    const title = [
        ...new Set(
            $('ol#breadcrumb li')
                .slice(1)
                .toArray()
                .map((li) => $(li).text())
        ),
    ].join(' > ');
    const description = $('div.xml').html();
    const image = new URL($('li.active a img').prop('src'), rootUrl).href;
    const icon = new URL($('link[rel="shortcut icon"]').prop('href'), rootUrl).href;

    const items = data
        ? [
              {
                  title: `${data.title} ${data.releaseTime}`,
                  link: new URL(data.link, rootUrl).href,
                  description: art(path.join(__dirname, 'templates/description.art'), {
                      description,
                      image: data.image
                          ? {
                                src: new URL(data.image, rootUrl).href,
                                alt: data.title,
                            }
                          : undefined,
                  }),
                  author:
                      $(
                          $('div.col-xs-8 span')
                              .toArray()
                              .filter((a) => $(a).text().startsWith('来源'))
                              ?.pop()
                      )
                          ?.text()
                          ?.split(/：/)
                          ?.pop() || author,
                  guid: `cma${data.link}#${data.releaseTime.replaceAll(/\s/g, '-')}`,
                  pubDate: timezone(parseDate(data.releaseTime), +8),
                  enclosure_url: new URL(data.image, rootUrl).href,
                  enclosure_type: data.image ? `image/${data.image.split(/\./).pop()}` : undefined,
              },
          ]
        : [];

    ctx.state.data = {
        item: items,
        title: `${author} - ${title}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'zh',
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author,
        allowEmpty: true,
    };
};
