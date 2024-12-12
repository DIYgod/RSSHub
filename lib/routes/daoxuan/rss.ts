// import { Route } from '@/types';
// import ofetch from '@/utils/ofetch';
// import { load } from 'cheerio';
// import { parseDate } from '@/utils/parse-date';

// export const route: Route = {
//     path: '/',
//     categories: ['blog'],
//     example: '/daoxuan',
//     radar: [
//         {
//             source: ['daoxuan.cc/'],
//         },
//     ],
//     name: '全部文章',
//     maintainers: ['dx2331lxz'],
//     url: 'daoxuan.cc/',
//     handler: (ctx) => {
//         const url = 'https://daoxuan.cc/archives/';
//         const response = await ofetch(url);
//         const $ = load(response);
//         const items = $('div.article-sort-item')
//             .toArray()
//             .map((item) => {
//                 item = $(item);
//                 const a = item.find('a').first();
//                 return {
//                     title: a.attr('title'),
//                     link: `https://daoxuan.cc${a.attr('href')}`,
//                     pubDate: parseDate(),
//                 };
//             });
//     },
// };
