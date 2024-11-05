import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/scholar/:query',
    categories: ['journal', 'popular'],
    example: '/google/scholar/data+visualization',
    parameters: { query: 'query statement which supports「Basic」and「Advanced」modes' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Scholar Keywords Monitoring',
    maintainers: ['HenryQW'],
    handler,
    description: `:::warning
  Google Scholar has strict anti-crawling mechanism implemented, the demo below doesn't guarantee availability. Please deploy your own instance as it might increase the stability.
  :::

  1.  Basic mode, sample query is the keywords desired, eg.「data visualization」, [https://rsshub.app/google/scholar/data+visualization](https://rsshub.app/google/scholar/data+visualization).

  2.  Advanced mode, visit [Google Scholar](https://scholar.google.com/schhp?hl=en\&as_sdt=0,5), click the top left corner and select「Advanced Search」, fill in your conditions and submit the search. The URL should look like this: [https://scholar.google.com/scholar?as\_q=data+visualization\&as\_epq=\&as\_oq=\&as\_eq=\&as\_occt=any\&as\_sauthors=\&as\_publication=\&as\_ylo=2018\&as\_yhi=\&hl=en\&as\_sdt=0%2C5](https://scholar.google.com/scholar?as_q=data+visualization\&as_epq=\&as_oq=\&as_eq=\&as_occt=any\&as_sauthors=\&as_publication=\&as_ylo=2018\&as_yhi=\&hl=en\&as_sdt=0%2C5), copy everything after \`https://scholar.google.com/scholar?\` from the URL and use it as the query for this route. The complete URL for the above example should look like this: [https://rsshub.app/google/scholar/as\_q=data+visualization\&as\_epq=\&as\_oq=\&as\_eq=\&as\_occt=any\&as\_sauthors=\&as\_publication=\&as\_ylo=2018\&as\_yhi=\&hl=en\&as\_sdt=0%2C5](https://rsshub.app/google/scholar/as_q=data+visualization\&as_epq=\&as_oq=\&as_eq=\&as_occt=any\&as_sauthors=\&as_publication=\&as_ylo=2018\&as_yhi=\&hl=en\&as_sdt=0%2C5).`,
};

async function handler(ctx) {
    let params = ctx.req.param('query');
    let query = params;
    let description = `Google Scholar Monitor Query: ${query}`;

    if (params.includes('as_q=')) {
        const reg = /as_q=(.*?)&/g;
        query = reg.exec(params)[1];
        description = `Google Scholar Monitor Advanced Query: ${query}`;
    } else {
        params = 'q=' + params;
    }

    const url = `https://scholar.google.com/scholar?${params}`;

    const response = await got({
        method: 'get',
        url,
    });

    const $ = load(response.data);
    const list = $('#gs_res_ccl_mid .gs_r.gs_or.gs_scl .gs_ri').get();

    const out = list.map((item) => {
        const $ = load(item);
        const itemUrl = $('h3 a').attr('href');
        return {
            title: $('h3 a').text(),
            author: $('.gs_a').text(),
            description: $('.gs_rs').text(),
            link: itemUrl,
            guid: itemUrl,
        };
    });

    return {
        title: `Google Scholar Monitor: ${query}`,
        link: url,
        description,
        item: out,
    };
}
