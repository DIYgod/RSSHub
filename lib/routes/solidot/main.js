// Warning: The author still knows nothing about javascript!

// params:
// type: subject type

import got from '~/utils/got.js'; // get web content
import cheerio from 'cheerio'; // html parser
import fs from 'fs';
import path from 'path';

import get_article from './_article.js';

import {createCommons} from 'simport';
import {createCommons} from 'simport';
import {createCommons} from 'simport';
import {createCommons} from 'simport';
import {createCommons} from 'simport';
import {createCommons} from 'simport';
import {createCommons} from 'simport';
import {createCommons} from 'simport';
import {createCommons} from 'simport';
import {createCommons} from 'simport';

const {
    require
} = createCommons(import.meta.url);

const base_url = 'https://$type$.solidot.org';
export default async (ctx) => {
    const {
        type = 'www'
    } = ctx.params;

    const list_url = base_url.replace('$type$', type);
    const {
        data
    } = await got({
        method: 'get',
        url: list_url,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0',
        https: {
            certificateAuthority: [fs.readFileSync(path.resolve(__dirname, './wotrust.pem')), fs.readFileSync(path.resolve(__dirname, './sectigo.pem'))],
            rejectUnauthorized: true,
        },
    }); // content is html format
    const $ = cheerio.load(data);

    // get urls
    const a = $('div.block_m').find('div.bg_htit > h2 > a');
    const urls = [];
    for (let i = 0; i < a.length; ++i) {
        urls.push($(a[i]).attr('href'));
    }

    // get articles
    const msg_list = await Promise.all(urls.map((u) => get_article(u)));

    // feed the data
    ctx.state.data = {
        title: '奇客的资讯，重要的东西',
        link: list_url,
        item: msg_list,
    };
};
