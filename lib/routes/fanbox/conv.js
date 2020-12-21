const got = require('@/utils/got');

const get_header = require('./header');

async function get_twitter(t) {
    try {
        const resp = await got(`https://publish.twitter.com/oembed?url=${t}`);
        return resp.data.html;
    } catch (_) {
        return `<div style="border-style:solid;border-width:0.5px;padding:0.5em;">This tweet may not exist</div>`;
    }
}

async function get_fanbox(p) {
    try {
        const m = p.match(/creator\/([0-9]+)\/post\/([0-9]+)/);
        const post_id = m[2];
        const api_url = `https://api.fanbox.cc/post.info?postId=${post_id}`;
        const resp = await got(api_url, { headers: get_header() });
        const post = resp.data.body;

        const home_url = `https://${post.creatorId}.fanbox.cc`;
        const web_url = `${home_url}/posts/${post.id}`;
        const datetime = new Date(post.updatedDatetime).toLocaleString('ja');

        const box_html = `
            <div style="width:640;padding:0.5em;border-style:solid;border-width:0.5px">
                <img width=300 src="${post.imageForShare}" />
                <br/>
                <a href="${web_url}" style="font-weight:bold">${post.title}</a>
                <br/>
                <br/>
                <a href="${home_url}" style="margin-right:1.6em">${post.user.name}</a>
                <span style="margin-right:1.6em">Modify: ${datetime}</span>
                <span>${post.feeRequired} JPY</span>
            </div>
        `;
        return { url: web_url, html: box_html };
    } catch (_) {
        return { url: null, html: `<div style="border-style:solid;border-width:0.5px;padding:0.5em;">fanbox post (${p}) may not exist</div>` };
    }
}

// embedded items
async function embed_map(e) {
    const id = e.contentId || e.videoId;
    const sp = e.serviceProvider;

    let ret = `Unknown host: ${sp}, with ID: ${id}`;
    let url = null;

    try {
        switch (sp) {
            case 'youtube':
                url = `https://www.youtube.com/embed/${id}`;
                ret = `<iframe type="text/html" width="640" height="360" src="${url}" frameborder="0" allowfullscreen></iframe>`;
                break;
            case 'vimeo':
                url = `https://player.vimeo.com/video/${id}`;
                ret = `<iframe type="text/html" width="640" height="360" src="${url}" frameborder="0" allowfullscreen></iframe>`;
                break;
            case 'soundcloud':
                url = `https://soundcloud.com/${id}`;
                ret = `<iframe width="640" height="166" frameborder="0" allowfullscreen src="https://w.soundcloud.com/player/?url=${url}"></iframe>`;
                break;
            case 'twitter':
                url = `https://twitter.com/i/status/${id}`;
                ret = await get_twitter(url);
                break;
            case 'google_forms':
                url = `https://docs.google.com/forms/d/e/${id}/viewform?embedded=true`;
                ret = `<iframe src="${url}" width=640 height=800 frameborder="0" allowfullscreen></iframe>`;
                break;
            case 'fanbox': {
                const info = await get_fanbox(id);
                url = info.url;
                ret = info.html;
                break;
            }
            case 'gist':
                url = `https://gist.github.com/${id}`;
                ret = `<iframe frameborder="0" width="640" height="480" srcdoc="<script src=${url}.js></script>"></iframe>`;
                break;
        }
        if (url) {
            ret += `<br/><a href="${url}" style="font-size:0.6em;">Click here if embedded content is not loaded.</a>`;
        }
    } catch (_) {
        _;
    }

    return ret;
}

// render <p/> blocks
function passage_conv(p) {
    const seg = p.text.split('');
    // seg.push('');
    if (p.styles) {
        p.styles.map((s) => {
            switch (s.type) {
                case 'bold':
                    seg[s.offset] = `<b>` + seg[s.offset];
                    seg[s.offset + s.length - 1] += `</b>`;
                    break;
            }
            return s;
        });
    }
    if (p.links) {
        p.links.map((l) => {
            seg[l.offset] = `<a href="${l.url}">` + seg[l.offset];
            seg[l.offset + l.length - 1] += `</a>`;
            return l;
        });
    }
    const ret = seg.join('');
    // console.log(ret)
    return ret;
}

// article types
function text_t(body) {
    return body.text || '';
}

function image_t(body) {
    let ret = body.text || '';
    body.images.map((i) => (ret += `<hr><img src="${i.originalUrl}">`));
    return ret;
}

function file_t(body) {
    let ret = body.text || '';
    body.files.map((f) => (ret += `<br><a href="${f.url}" download="${f.name}.${f.extension}">${f.name}.${f.extension}</a>`));
    return ret;
}

async function video_t(body) {
    let ret = body.text || '';
    ret += (await embed_map(body.video)) || '';
    return ret;
}

async function blog_t(body) {
    let ret = [];
    for (let x = 0; x < body.blocks.length; ++x) {
        const b = body.blocks[x];
        ret.push('<p>');

        switch (b.type) {
            case 'p':
                ret.push(passage_conv(b));
                break;
            case 'header':
                ret.push(`<h2>${b.text}</h2>`);
                break;
            case 'image': {
                const i = body.imageMap[b.imageId];
                ret.push(`<img src="${i.originalUrl}">`);
                break;
            }
            case 'file': {
                const f = body.fileMap[b.fileId];
                ret.push(`<a href="${f.url}" download="${f.name}.${f.extension}">${f.name}.${f.extension}</a>`);
                break;
            }
            case 'embed':
                ret.push(embed_map(body.embedMap[b.embedId])); // Promise object
                break;
        }
    }
    ret = await Promise.all(ret); // get real data
    return ret.join('');
}

// parse by type
async function conv_article(i) {
    let ret = '';
    if (i.title) {
        ret += `[${i.type}] ${i.title}<hr>`;
    }
    if (i.feeRequired !== 0) {
        ret += `Fee Required: <b>${i.feeRequired} JPY/month</b><hr>`;
    }
    if (i.coverImageUrl) {
        ret += `<img src="${i.coverImageUrl}"><hr>`;
    }

    if (!i.body) {
        ret += `${i.excerpt}`;
        return ret;
    }

    // console.log(i);
    // skip paywall

    switch (i.type) {
        case 'text':
            ret += text_t(i.body);
            break;
        case 'file':
            ret += file_t(i.body);
            break;
        case 'image':
            ret += image_t(i.body);
            break;
        case 'video':
            ret += await video_t(i.body);
            break;
        case 'article':
            ret += await blog_t(i.body);
            break;
        default:
            ret += '<b>Unsupported content (RSSHub)</b>';
    }
    return ret;
}

// render wrapper
module.exports = async (i) => ({
    title: i.title || `No title`,
    description: await conv_article(i),
    pubDate: new Date(i.publishedDatetime).toUTCString(),
    link: `https://${i.creatorId}.fanbox.cc/posts/${i.id}`,
    category: i.tags,
});
