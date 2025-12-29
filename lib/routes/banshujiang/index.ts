import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderDescription } from './templates/description';

export const handler = async (ctx: Context): Promise<Data> => {
    const { category } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '20', 10);

    const baseUrl: string = 'http://banshujiang.cn';
    const targetUrl: string = new URL(`${category ? 'e_books' : `category/${category}`}/page/1`, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'zh';

    let items: DataItem[] = [];

    items = $('ul.small-list li.row')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);
            const $aEl: Cheerio<Element> = $el.find('span.book-property__title').first().next('a');

            const title: string = $aEl.text().trim();
            const image: string | undefined = $el.find('meta[property="og:image"]').attr('content') ?? $el.find('img').attr('src');
            const description: string | undefined = renderDescription({
                images: image
                    ? [
                          {
                              src: image,
                              alt: title,
                          },
                      ]
                    : undefined,
                description: $el.find('div.small-list__item-desc').html(),
            });
            const pubDateStr: string | undefined = image?.split(/\?timestamp=/).pop();
            const linkUrl: string | undefined = $aEl.attr('href');
            const categoryEls: Element[] = $el.find('span.book-property__title').toArray();
            const categories: string[] = [...new Set(categoryEls.map((el) => $(el).next('span').text()).filter(Boolean))];
            const authors: DataItem['author'] = $el.find('span.book-property__title').eq(1).text();
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr, 'x') : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                category: categories,
                author: authors,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                updated: upDatedStr ? parseDate(upDatedStr, 'x') : undefined,
                language,
            };

            return processedItem;
        });

    items = await Promise.all(
        items.map((item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('div.ebook-title').text().trim();
                const image: string | undefined = $$('div.span6 img').attr('src');
                const description: string | undefined = renderDescription({
                    images: image
                        ? [
                              {
                                  src: image,
                                  alt: title,
                              },
                          ]
                        : undefined,
                    description: ($$('table').first().parent().html() ?? '') + ($$('div.ebook-markdown').html() ?? ''),
                });

                $$('ul.inline').parent().parent().remove();

                const pubDateStr: string | undefined = image?.split(/\?timestamp=/).pop();
                const linkUrl: string | undefined = $$('div.ebook-title a').attr('href');
                const categories: string[] = [
                    ...new Set(
                        $$('table tr')
                            .toArray()
                            .map((el) => $$(el).find('td').last().text())
                            .filter(Boolean)
                    ),
                ];
                const authors: DataItem['author'] = $$('table tr').first().find('td').last().text();
                const upDatedStr: string | undefined = pubDateStr;

                const processedItem: DataItem = {
                    title,
                    description,
                    pubDate: pubDateStr ? parseDate(pubDateStr, 'x') : item.pubDate,
                    link: linkUrl ? new URL(linkUrl, baseUrl).href : item.link,
                    category: categories,
                    author: authors,
                    content: {
                        html: description,
                        text: description,
                    },
                    image,
                    banner: image,
                    updated: upDatedStr ? parseDate(upDatedStr, 'x') : item.updated,
                    language,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    const title: string = $('title')
        .text()
        .replace(/第1页\s-\s/, '');

    return {
        title,
        description: title.split(/-/).pop()?.trim(),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: new URL('logo.png?imageView2/2/w/128/h/128/q/100', baseUrl).href,
        author: $('a.brand').text(),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/:category{.+}?',
    name: '分类',
    url: 'banshujiang.cn',
    maintainers: ['nczitzk'],
    handler,
    example: '/banshujiang/other/人工智能',
    parameters: {
        category: {
            description: '分类，默认为全部，可在对应分类页 URL 中找到',
            options: [
                {
                    label: 'ActionScript',
                    value: 'programming_language/ActionScript',
                },
                {
                    label: 'ASP.net',
                    value: 'programming_language/ASP.net',
                },
                {
                    label: 'C',
                    value: 'programming_language/C',
                },
                {
                    label: 'C#',
                    value: 'programming_language/C%23',
                },
                {
                    label: 'C++',
                    value: 'programming_language/C++',
                },
                {
                    label: 'CoffeeScript',
                    value: 'programming_language/CoffeeScript',
                },
                {
                    label: 'CSS',
                    value: 'programming_language/CSS',
                },
                {
                    label: 'Dart',
                    value: 'programming_language/Dart',
                },
                {
                    label: 'Elixir',
                    value: 'programming_language/Elixir',
                },
                {
                    label: 'Erlang',
                    value: 'programming_language/Erlang',
                },
                {
                    label: 'F#',
                    value: 'programming_language/F%23',
                },
                {
                    label: 'Go',
                    value: 'programming_language/Go',
                },
                {
                    label: 'Groovy',
                    value: 'programming_language/Groovy',
                },
                {
                    label: 'Haskell',
                    value: 'programming_language/Haskell',
                },
                {
                    label: 'HTML5',
                    value: 'programming_language/HTML5',
                },
                {
                    label: 'Java',
                    value: 'programming_language/Java',
                },
                {
                    label: 'JavaScript',
                    value: 'programming_language/JavaScript',
                },
                {
                    label: 'Kotlin',
                    value: 'programming_language/Kotlin',
                },
                {
                    label: 'Lua',
                    value: 'programming_language/Lua',
                },
                {
                    label: 'Objective-C',
                    value: 'programming_language/Objective-C',
                },
                {
                    label: 'Perl',
                    value: 'programming_language/Perl',
                },
                {
                    label: 'PHP',
                    value: 'programming_language/PHP',
                },
                {
                    label: 'PowerShell',
                    value: 'programming_language/PowerShell',
                },
                {
                    label: 'Python',
                    value: 'programming_language/Python',
                },
                {
                    label: 'R',
                    value: 'programming_language/R',
                },
                {
                    label: 'Ruby',
                    value: 'programming_language/Ruby',
                },
                {
                    label: 'Rust',
                    value: 'programming_language/Rust',
                },
                {
                    label: 'Scala',
                    value: 'programming_language/Scala',
                },
                {
                    label: 'Shell Script',
                    value: 'programming_language/Shell%20Script',
                },
                {
                    label: 'SQL',
                    value: 'programming_language/SQL',
                },
                {
                    label: 'Swift',
                    value: 'programming_language/Swift',
                },
                {
                    label: 'TypeScript',
                    value: 'programming_language/TypeScript',
                },
                {
                    label: 'Android',
                    value: 'mobile_development/Android',
                },
                {
                    label: 'iOS',
                    value: 'mobile_development/iOS',
                },
                {
                    label: 'Linux',
                    value: 'operation_system/Linux',
                },
                {
                    label: 'Mac OS X',
                    value: 'operation_system/Mac%20OS%20X',
                },
                {
                    label: 'Unix',
                    value: 'operation_system/Unix',
                },
                {
                    label: 'Windows',
                    value: 'operation_system/Windows',
                },
                {
                    label: 'DB2',
                    value: 'database/DB2',
                },
                {
                    label: 'MongoDB',
                    value: 'database/MongoDB',
                },
                {
                    label: 'MySQL',
                    value: 'database/MySQL',
                },
                {
                    label: 'Oracle',
                    value: 'database/Oracle',
                },
                {
                    label: 'PostgreSQL',
                    value: 'database/PostgreSQL',
                },
                {
                    label: 'SQL Server',
                    value: 'database/SQL%20Server',
                },
                {
                    label: 'SQLite',
                    value: 'database/SQLite',
                },
                {
                    label: 'Apache 项目',
                    value: 'open_source/Apache项目',
                },
                {
                    label: 'Web 开发',
                    value: 'open_source/Web开发',
                },
                {
                    label: '区块链',
                    value: 'open_source/区块链',
                },
                {
                    label: '程序开发',
                    value: 'open_source/程序开发',
                },
                {
                    label: '人工智能',
                    value: 'other/人工智能',
                },
                {
                    label: '容器技术',
                    value: 'other/容器技术',
                },
                {
                    label: '中文',
                    value: 'language/中文',
                },
                {
                    label: '英文',
                    value: 'language/英文',
                },
            ],
        },
    },
    description: `::: tip
订阅 [人工智能](https://banshujiang.cn//category/other/人工智能)，其源网址为 \`https://banshujiang.cn//category/other/人工智能\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/banshujiang/category/other/人工智能\`](https://rsshub.app/banshujiang/other/人工智能)。
:::

<details>
  <summary>更多分类</summary>

#### 编程语言

| 分类                                                                                          | ID                                                                                                                 |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| [ActionScript](http://www.banshujiang.cn/category/programming_language/ActionScript/page/1)   | [category/programming_language/ActionScript](https://rsshub.app/banshujiang/programming_language/ActionScript)     |
| [ASP.net](http://www.banshujiang.cn/category/programming_language/ASP.net/page/1)             | [category/programming_language/ASP.net](https://rsshub.app/banshujiang/programming_language/ASP.net)               |
| [C](http://www.banshujiang.cn/category/programming_language/C)                                | [category/programming_language/C](https://rsshub.app/banshujiang/programming_language/C)                           |
| [C#](http://www.banshujiang.cn/category/programming_language/C%23)                            | [category/programming_language/C%23](https://rsshub.app/banshujiang/programming_language/C%23)                     |
| [C++](http://www.banshujiang.cn/category/programming_language/C++)                            | [category/programming_language/C++](https://rsshub.app/banshujiang/programming_language/C++)                       |
| [CoffeeScript](http://www.banshujiang.cn/category/programming_language/CoffeeScript)          | [category/programming_language/CoffeeScript](https://rsshub.app/banshujiang/programming_language/CoffeeScript)     |
| [CSS](http://www.banshujiang.cn/category/programming_language/CSS)                            | [category/programming_language/CSS)                                                                                |
| [Dart](http://www.banshujiang.cn/category/programming_language/Dart)                          | [category/programming_language/Dart](https://rsshub.app/banshujiang/programming_language/Dart)                     |
| [Elixir](http://www.banshujiang.cn/category/programming_language/Elixir)                      | [category/programming_language/Elixir](https://rsshub.app/banshujiang/programming_language/Elixir)                 |
| [Erlang](http://www.banshujiang.cn/category/programming_language/Erlang)                      | [category/programming_language/Erlang](https://rsshub.app/banshujiang/programming_language/Erlang)                 |
| [F#](http://www.banshujiang.cn/category/programming_language/F%23)                            | [category/programming_language/F%23](https://rsshub.app/banshujiang/programming_language/F%23)                     |
| [Go](http://www.banshujiang.cn/category/programming_language/Go)                              | [category/programming_language/Go](https://rsshub.app/banshujiang/programming_language/Go)                         |
| [Groovy](http://www.banshujiang.cn/category/programming_language/Groovy)                      | [category/programming_language/Groovy](https://rsshub.app/banshujiang/programming_language/Groovy)                 |
| [Haskell](http://www.banshujiang.cn/category/programming_language/Haskell)                    | [category/programming_language/Haskell](https://rsshub.app/banshujiang/programming_language/Haskell)               |
| [HTML5](http://www.banshujiang.cn/category/programming_language/HTML5)                        | [category/programming_language/HTML5](https://rsshub.app/banshujiang/programming_language/HTML5)                   |
| [Java](http://www.banshujiang.cn/category/programming_language/Java)                          | [category/programming_language/Java](https://rsshub.app/banshujiang/programming_language/Java)                     |
| [JavaScript](http://www.banshujiang.cn/category/programming_language/JavaScript)              | [category/programming_language/JavaScript](https://rsshub.app/banshujiang/programming_language/JavaScript)         |
| [Kotlin](http://www.banshujiang.cn/category/programming_language/Kotlin)                      | [category/programming_language/Kotlin](https://rsshub.app/banshujiang/programming_language/Kotlin)                 |
| [Lua](http://www.banshujiang.cn/category/programming_language/Lua)                            | [category/programming_language/Lua](https://rsshub.app/banshujiang/programming_language/Lua)                       |
| [Objective-C](http://www.banshujiang.cn/category/programming_language/Objective-C)            | [category/programming_language/Objective-C](https://rsshub.app/banshujiang/programming_language/Objective-C)       |
| [Perl](http://www.banshujiang.cn/category/programming_language/Perl)                          | [category/programming_language/Perl](https://rsshub.app/banshujiang/programming_language/Perl)                     |
| [PHP](http://www.banshujiang.cn/category/programming_language/PHP)                            | [category/programming_language/PHP](https://rsshub.app/banshujiang/programming_language/PHP)                       |
| [PowerShell](http://www.banshujiang.cn/category/programming_language/PowerShell)              | [category/programming_language/PowerShell](https://rsshub.app/banshujiang/programming_language/PowerShell)         |
| [Python](http://www.banshujiang.cn/category/programming_language/Python)                      | [category/programming_language/Python](https://rsshub.app/banshujiang/programming_language/Python)                 |
| [R](http://www.banshujiang.cn/category/programming_language/R/page/1)                         | [category/programming_language/R](https://rsshub.app/banshujiang/programming_language/R)                           |
| [Ruby](http://www.banshujiang.cn/category/programming_language/Ruby/page/1)                   | [category/programming_language/Ruby](https://rsshub.app/banshujiang/programming_language/Ruby)                     |
| [Rust](http://www.banshujiang.cn/category/programming_language/Rust/page/1)                   | [category/programming_language/Rust](https://rsshub.app/banshujiang/programming_language/Rust)                     |
| [Scala](http://www.banshujiang.cn/category/programming_language/Scala/page/1)                 | [category/programming_language/Scala](https://rsshub.app/banshujiang/programming_language/Scala)                   |
| [Shell Script](http://www.banshujiang.cn/category/programming_language/Shell%20Script/page/1) | [category/programming_language/Shell%20Script](https://rsshub.app/banshujiang/programming_language/Shell%20Script) |
| [SQL](http://www.banshujiang.cn/category/programming_language/SQL/page/1)                     | [category/programming_language/SQL](https://rsshub.app/banshujiang/programming_language/SQL)                       |
| [Swift](http://www.banshujiang.cn/category/programming_language/Swift/page/1)                 | [category/programming_language/Swift](https://rsshub.app/banshujiang/programming_language/Swift)                   |
| [TypeScript](http://www.banshujiang.cn/category/programming_language/TypeScript/page/1)       | [category/programming_language/TypeScript](https://rsshub.app/banshujiang/programming_language/TypeScript)         |

#### 移动开发

| 分类                                                                            | ID                                                                                               |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [Android](http://www.banshujiang.cn/category/mobile_development/Android/page/1) | [category/mobile_development/Android](https://rsshub.app/banshujiang/mobile_development/Android) |
| [iOS](http://www.banshujiang.cn/category/mobile_development/iOS/page/1)         | [category/mobile_development/iOS](https://rsshub.app/banshujiang/mobile_development/iOS)         |

#### 操作系统

| 分类                                                                                | ID                                                                                                     |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [Linux](http://www.banshujiang.cn/category/operation_system/Linux/page/1)           | [category/operation_system/Linux](https://rsshub.app/banshujiang/operation_system/Linux)               |
| [Mac OS X](http://www.banshujiang.cn/category/operation_system/Mac%20OS%20X/page/1) | [category/operation_system/Mac%20OS%20X](https://rsshub.app/banshujiang/operation_system/Mac%20OS%20X) |
| [Unix](http://www.banshujiang.cn/category/operation_system/Unix/page/1)             | [category/operation_system/Unix](https://rsshub.app/banshujiang/operation_system/Unix)                 |
| [Windows](http://www.banshujiang.cn/category/operation_system/Windows/page/1)       | [category/operation_system/Windows](https://rsshub.app/banshujiang/operation_system/Windows)           |

#### 数据库

| 分类                                                                          | ID                                                                                     |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [DB2](http://www.banshujiang.cn/category/database/DB2/page/1)                 | [category/database/DB2](https://rsshub.app/banshujiang/database/DB2)                   |
| [MongoDB](http://www.banshujiang.cn/category/database/MongoDB/page/1)         | [category/database/MongoDB](https://rsshub.app/banshujiang/database/MongoDB)           |
| [MySQL](http://www.banshujiang.cn/category/database/MySQL/page/1)             | [category/database/MySQL](https://rsshub.app/banshujiang/database/MySQL)               |
| [Oracle](http://www.banshujiang.cn/category/database/Oracle/page/1)           | [category/database/Oracle](https://rsshub.app/banshujiang/database/Oracle)             |
| [PostgreSQL](http://www.banshujiang.cn/category/database/PostgreSQL/page/1)   | [category/database/PostgreSQL](https://rsshub.app/banshujiang/database/PostgreSQL)     |
| [SQL Server](http://www.banshujiang.cn/category/database/SQL%20Server/page/1) | [category/database/SQL%20Server](https://rsshub.app/banshujiang/database/SQL%20Server) |
| [SQLite](http://www.banshujiang.cn/category/database/SQLite/page/1)           | [category/database/SQLite](https://rsshub.app/banshujiang/database/SQLite)             |

#### 开源软件

| 分类                                                                            | ID                                                                                        |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [Apache 项目](http://www.banshujiang.cn/category/open_source/Apache项目/page/1) | [category/open_source/Apache 项目](https://rsshub.app/banshujiang/open_source/Apache项目) |
| [Web 开发](http://www.banshujiang.cn/category/open_source/Web开发/page/1)       | [category/open_source/Web 开发](https://rsshub.app/banshujiang/open_source/Web开发)       |
| [区块链](http://www.banshujiang.cn/category/open_source/区块链/page/1)          | [category/open_source/区块链](https://rsshub.app/banshujiang/open_source/区块链)          |
| [程序开发](http://www.banshujiang.cn/category/open_source/程序开发/page/1)      | [category/open_source/程序开发](https://rsshub.app/banshujiang/open_source/程序开发)      |

#### 其他

| 分类                                                                 | ID                                                                       |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [人工智能](http://www.banshujiang.cn/category/other/人工智能/page/1) | [category/other/人工智能](https://rsshub.app/banshujiang/other/人工智能) |
| [容器技术](http://www.banshujiang.cn/category/other/容器技术/page/1) | [category/other/容器技术](https://rsshub.app/banshujiang/other/容器技术) |

#### 语言

| 分类                                                            | ID                                                                     |
| --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [中文](http://www.banshujiang.cn/category/language/中文/page/1) | [category/language/中文](https://rsshub.app/banshujiang/language/中文) |
| [英文](http://www.banshujiang.cn/category/language/英文/page/1) | [category/language/英文](https://rsshub.app/banshujiang/language/英文) |

</details>
`,
    categories: ['reading'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['banshujiang.cn/:category?'],
            target: (params) => {
                const category: string = params.category;

                return `/banshujiang${category ? `/${category}` : ''}`;
            },
        },
        {
            title: 'ActionScript',
            source: ['banshujiang.cn/programming_language/ActionScript/page/1'],
            target: '/programming_language/ActionScript',
        },
        {
            title: 'ASP.net',
            source: ['banshujiang.cn/programming_language/ASP.net/page/1'],
            target: '/programming_language/ASP.net',
        },
        {
            title: 'C',
            source: ['banshujiang.cn/programming_language/C'],
            target: '/programming_language/C',
        },
        {
            title: 'C#',
            source: ['banshujiang.cn/programming_language/C%23'],
            target: '/programming_language/C%23',
        },
        {
            title: 'C++',
            source: ['banshujiang.cn/programming_language/C++'],
            target: '/programming_language/C++',
        },
        {
            title: 'CoffeeScript',
            source: ['banshujiang.cn/programming_language/CoffeeScript'],
            target: '/programming_language/CoffeeScript',
        },
        {
            title: 'CSS',
            source: ['banshujiang.cn/programming_language/CSS'],
            target: '/programming_language/CSS',
        },
        {
            title: 'Dart',
            source: ['banshujiang.cn/programming_language/Dart'],
            target: '/programming_language/Dart',
        },
        {
            title: 'Elixir',
            source: ['banshujiang.cn/programming_language/Elixir'],
            target: '/programming_language/Elixir',
        },
        {
            title: 'Erlang',
            source: ['banshujiang.cn/programming_language/Erlang'],
            target: '/programming_language/Erlang',
        },
        {
            title: 'F#',
            source: ['banshujiang.cn/programming_language/F%23'],
            target: '/programming_language/F%23',
        },
        {
            title: 'Go',
            source: ['banshujiang.cn/programming_language/Go'],
            target: '/programming_language/Go',
        },
        {
            title: 'Groovy',
            source: ['banshujiang.cn/programming_language/Groovy'],
            target: '/programming_language/Groovy',
        },
        {
            title: 'Haskell',
            source: ['banshujiang.cn/programming_language/Haskell'],
            target: '/programming_language/Haskell',
        },
        {
            title: 'HTML5',
            source: ['banshujiang.cn/programming_language/HTML5'],
            target: '/programming_language/HTML5',
        },
        {
            title: 'Java',
            source: ['banshujiang.cn/programming_language/Java'],
            target: '/programming_language/Java',
        },
        {
            title: 'JavaScript',
            source: ['banshujiang.cn/programming_language/JavaScript'],
            target: '/programming_language/JavaScript',
        },
        {
            title: 'Kotlin',
            source: ['banshujiang.cn/programming_language/Kotlin'],
            target: '/programming_language/Kotlin',
        },
        {
            title: 'Lua',
            source: ['banshujiang.cn/programming_language/Lua'],
            target: '/programming_language/Lua',
        },
        {
            title: 'Objective-C',
            source: ['banshujiang.cn/programming_language/Objective-C'],
            target: '/programming_language/Objective-C',
        },
        {
            title: 'Perl',
            source: ['banshujiang.cn/programming_language/Perl'],
            target: '/programming_language/Perl',
        },
        {
            title: 'PHP',
            source: ['banshujiang.cn/programming_language/PHP'],
            target: '/programming_language/PHP',
        },
        {
            title: 'PowerShell',
            source: ['banshujiang.cn/programming_language/PowerShell'],
            target: '/programming_language/PowerShell',
        },
        {
            title: 'Python',
            source: ['banshujiang.cn/programming_language/Python'],
            target: '/programming_language/Python',
        },
        {
            title: 'R',
            source: ['banshujiang.cn/programming_language/R/page/1'],
            target: '/programming_language/R',
        },
        {
            title: 'Ruby',
            source: ['banshujiang.cn/programming_language/Ruby/page/1'],
            target: '/programming_language/Ruby',
        },
        {
            title: 'Rust',
            source: ['banshujiang.cn/programming_language/Rust/page/1'],
            target: '/programming_language/Rust',
        },
        {
            title: 'Scala',
            source: ['banshujiang.cn/programming_language/Scala/page/1'],
            target: '/programming_language/Scala',
        },
        {
            title: 'Shell Script',
            source: ['banshujiang.cn/programming_language/Shell%20Script/page/1'],
            target: '/programming_language/Shell%20Script',
        },
        {
            title: 'SQL',
            source: ['banshujiang.cn/programming_language/SQL/page/1'],
            target: '/programming_language/SQL',
        },
        {
            title: 'Swift',
            source: ['banshujiang.cn/programming_language/Swift/page/1'],
            target: '/programming_language/Swift',
        },
        {
            title: 'TypeScript',
            source: ['banshujiang.cn/programming_language/TypeScript/page/1'],
            target: '/programming_language/TypeScript',
        },
        {
            title: 'Android',
            source: ['banshujiang.cn/mobile_development/Android/page/1'],
            target: '/mobile_development/Android',
        },
        {
            title: 'iOS',
            source: ['banshujiang.cn/mobile_development/iOS/page/1'],
            target: '/mobile_development/iOS',
        },
        {
            title: 'Linux',
            source: ['banshujiang.cn/operation_system/Linux/page/1'],
            target: '/operation_system/Linux',
        },
        {
            title: 'Mac OS X',
            source: ['banshujiang.cn/operation_system/Mac%20OS%20X/page/1'],
            target: '/operation_system/Mac%20OS%20X',
        },
        {
            title: 'Unix',
            source: ['banshujiang.cn/operation_system/Unix/page/1'],
            target: '/operation_system/Unix',
        },
        {
            title: 'Windows',
            source: ['banshujiang.cn/operation_system/Windows/page/1'],
            target: '/operation_system/Windows',
        },
        {
            title: 'DB2',
            source: ['banshujiang.cn/database/DB2/page/1'],
            target: '/database/DB2',
        },
        {
            title: 'MongoDB',
            source: ['banshujiang.cn/database/MongoDB/page/1'],
            target: '/database/MongoDB',
        },
        {
            title: 'MySQL',
            source: ['banshujiang.cn/database/MySQL/page/1'],
            target: '/database/MySQL',
        },
        {
            title: 'Oracle',
            source: ['banshujiang.cn/database/Oracle/page/1'],
            target: '/database/Oracle',
        },
        {
            title: 'PostgreSQL',
            source: ['banshujiang.cn/database/PostgreSQL/page/1'],
            target: '/database/PostgreSQL',
        },
        {
            title: 'SQL Server',
            source: ['banshujiang.cn/database/SQL%20Server/page/1'],
            target: '/database/SQL%20Server',
        },
        {
            title: 'SQLite',
            source: ['banshujiang.cn/database/SQLite/page/1'],
            target: '/database/SQLite',
        },
        {
            title: 'Apache 项目',
            source: ['banshujiang.cn/open_source/Apache项目/page/1'],
            target: '/open_source/Apache 项目',
        },
        {
            title: 'Web 开发',
            source: ['banshujiang.cn/open_source/Web开发/page/1'],
            target: '/open_source/Web 开发',
        },
        {
            title: '区块链',
            source: ['banshujiang.cn/open_source/区块链/page/1'],
            target: '/open_source/区块链',
        },
        {
            title: '程序开发',
            source: ['banshujiang.cn/open_source/程序开发/page/1'],
            target: '/open_source/程序开发',
        },
        {
            title: '人工智能',
            source: ['banshujiang.cn/other/人工智能/page/1'],
            target: '/other/人工智能',
        },
        {
            title: '容器技术',
            source: ['banshujiang.cn/other/容器技术/page/1'],
            target: '/other/容器技术',
        },
        {
            title: '中文',
            source: ['banshujiang.cn/language/中文/page/1'],
            target: '/language/中文',
        },
        {
            title: '英文',
            source: ['banshujiang.cn/language/英文/page/1'],
            target: '/language/英文',
        },
    ],
    view: ViewType.Articles,
};
