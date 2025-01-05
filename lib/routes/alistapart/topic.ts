import { Route } from '@/types';
import { getData, getList } from './utils';

export const route: Route = {
    path: '/:topic',
    categories: ['programming'],
    example: '/alistapart/application-development',
    parameters: { topic: 'Any Topic or from the table below. Defaults to All Articles' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['alistapart.com/blog/topic/:topic'],
            target: '/:topic',
        },
    ],
    name: 'Topics',
    maintainers: ['Rjnishant530'],
    handler,
    url: 'alistapart.com/articles/',
    description: `You have the option to utilize the main heading or use individual categories as topics for the path.

  | **Code**                    | *code*                    |
  | --------------------------- | ------------------------- |
  | **Application Development** | *application-development* |
  | **Browsers**                | *browsers*                |
  | **CSS**                     | *css*                     |
  | **HTML**                    | *html*                    |
  | **JavaScript**              | *javascript*              |
  | **The Server Side**         | *the-server-side*         |

  | **Content**          | *content*          |
  | -------------------- | ------------------ |
  | **Community**        | *community*        |
  | **Content Strategy** | *content-strategy* |
  | **Writing**          | *writing*          |

  | **Design**                 | *design*               |
  | -------------------------- | ---------------------- |
  | **Brand Identity**         | *brand-identity*       |
  | **Graphic Design**         | *graphic-design*       |
  | **Layout & Grids**         | *layout-grids*         |
  | **Mobile/Multidevice**     | *mobile-multidevice*   |
  | **Responsive Design**      | *responsive-design*    |
  | **Typography & Web Fonts** | *typography-web-fonts* |

  | **Industry & Business** | *industry-business* |
  | ----------------------- | ------------------- |
  | **Business**            | *business*          |
  | **Career**              | *career*            |
  | **Industry**            | *industry*          |
  | **State of the Web**    | *state-of-the-web*  |

  | **Process**            | *process*            |
  | ---------------------- | -------------------- |
  | **Creativity**         | *creativity*         |
  | **Project Management** | *project-management* |
  | **Web Strategy**       | *web-strategy*       |
  | **Workflow & Tools**   | *workflow-tools*     |

  | **User Experience**          | *user-experience*          |
  | ---------------------------- | -------------------------- |
  | **Accessibility**            | *accessibility*            |
  | **Information Architecture** | *information-architecture* |
  | **Interaction Design**       | *interaction-design*       |
  | **Usability**                | *usability*                |
  | **User Research**            | *user-research*            |`,
};

async function handler(ctx) {
    const baseUrl = 'https://alistapart.com';
    const searchRoute = '/wp-json/wp/v2/categories?slug=';
    const articleRoute = '/wp-json/wp/v2/article?categories=';
    const topic = ctx.req.param('topic');
    const id = (await getData(`${baseUrl}${searchRoute}${topic}`))[0]?.id;
    const data = await getData(`${baseUrl}${articleRoute}${id}&_embed`);
    const items = await getList(data);

    return {
        title: 'A List Apart',
        link: `${baseUrl}/blog/topic/${topic}`,
        item: items,
        description: `${topic[0].toUpperCase() + topic.slice(1)} Articles on aListApart.com`,
        logo: 'https://i0.wp.com/alistapart.com/wp-content/uploads/2019/03/cropped-icon_navigation-laurel-512.jpg?fit=192,192&ssl=1',
        icon: 'https://i0.wp.com/alistapart.com/wp-content/uploads/2019/03/cropped-icon_navigation-laurel-512.jpg?fit=32,32&ssl=1',
        language: 'en-us',
    };
}
