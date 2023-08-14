const cheerio = require('cheerio');
const got = require('@/utils/got');
const { getData, getList } = require('./utils');

const _website = 'dlnews';
const topics = {
    defi: 'DeFi',
    fintech: 'Fintech/VC/Deals',
    'llama-u': 'Llama U',
    markets: 'Markets',
    'people-culture': 'People & Culture',
    regulation: 'Regulation',
    snapshot: 'Snapshot',
    web3: 'Web3',
};

module.exports = async (ctx) => {
    const { category } = ctx.params;
    const baseUrl = 'https://www.dlnews.com';
    const apiPath = '/pf/api/v3/content/fetch/articles-api';
    let vertical;
    if (category) {
        vertical = category;
    } else {
        vertical = '';
    }

    const query = {
        author: '',
        date: 'now-1y/d',
        offset: 0,
        query: '',
        size: 15,
        sort: 'display_date:desc',
        vertical,
    };
    const data = await getData(`${baseUrl}${apiPath}?query=${encodeURIComponent(JSON.stringify(query))}&_website=${_website}`);
    const list = getList(data);
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);
                const scriptTagContent = $('script#fusion-metadata').text();
                const jsonData = JSON.parse(scriptTagContent.split('Fusion.globalContent=')[1].split('Fusion.globalContentConfig')[0].replace(/(;)/g, '')).content_elements;
                let end = false;
                item.description = jsonData.reduce((acc, curr) => {
                    let data = '';
                    if (!end) {
                        switch (curr.type) {
                            case 'custom_embed':
                                if (curr.embed.config.text) {
                                    data = '<ul>';
                                    data =
                                        data +
                                        curr.embed.config.text
                                            .split('\n')
                                            .filter(Boolean)
                                            .map((v) => `<li>${v}</li>`)
                                            .join('');
                                    data = data + '</ul>';
                                }

                                break;
                            case 'header':
                                data = `<h2>${curr.content}</h2>`;
                                if (data.includes('What we’re reading')) {
                                    data = '';
                                    end = true;
                                }
                                break;
                            case 'list':
                                data = curr.items.map((v) => `<li>${v.content}</li>`).join('');
                                data = curr.list_type === 'unordered' ? `<ul>${data}</ul>` : `<ol>${data}</ol>`;
                                break;
                            case 'image':
                                data = '<figure>';
                                data = data + `<img src=${curr.url} alt=${curr.alt_text}/>`;
                                data = data + `<figcaption> ${curr.subtitle}</figcaption>`;
                                data = data + '</figure>';
                                break;
                            case 'text':
                                data = curr.content;
                                if (data.includes('<b>NOW READ: </b>')) {
                                    data = '';
                                }
                                break;
                            default:
                                break;
                        }
                    }

                    return acc + data;
                }, '');
                return item;
            })
        )
    );

    ctx.state.data = {
        title: topics.hasOwnProperty(category) ? `${topics[category]} : DL News` : 'DL News',
        link: baseUrl,
        item: items,
        description: topics.hasOwnProperty(category) ? `${topics[category]} : News on dlnews.com` : 'Latest News on dlnews.com',
        logo: 'https://www.dlnews.com/pf/resources/favicon.ico?d=284',
        icon: 'https://www.dlnews.com/pf/resources/favicon.ico?d=284',
        language: 'en-us',
    };
};
