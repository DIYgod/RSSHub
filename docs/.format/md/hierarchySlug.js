// A fork of https://github.com/valeriangalliat/markdown-it-anchor
const slugify = (s) => encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-'));

const position = {
    false: 'push',
    true: 'unshift',
};

const hasProp = Object.prototype.hasOwnProperty;

const permalinkHref = (slug) => `#${slug}`;
const permalinkAttrs = (slug) => ({});

const renderPermalink = (slug, opts, state, idx) => {
    const space = () => Object.assign(new state.Token('text', '', 0), { content: ' ' });

    const linkTokens = [
        Object.assign(new state.Token('link_open', 'a', 1), {
            attrs: [['class', opts.permalinkClass], ['href', opts.permalinkHref(slug, state)], ...Object.entries(opts.permalinkAttrs(slug, state))],
        }),
        Object.assign(new state.Token('html_block', '', 0), {
            content: opts.permalinkSymbol,
        }),
        new state.Token('link_close', 'a', -1),
    ];

    // `push` or `unshift` according to position option.
    // Space is at the opposite side.
    if (opts.permalinkSpace) {
        linkTokens[position[!opts.permalinkBefore]](space());
    }
    state.tokens[idx + 1].children[position[opts.permalinkBefore]](...linkTokens);
};

const uniqueSlug = (slug, slugs, failOnNonUnique) => {
    let uniq = slug;
    let i = 2;
    if (failOnNonUnique && hasProp.call(slugs, uniq)) {
        throw Error(`User defined id attribute '${slug}' is NOT unique. Please fix it in your markdown to continue.`);
    } else {
        while (hasProp.call(slugs, uniq)) uniq = `${slug}-${i++}`;
    }
    slugs[uniq] = true;
    return uniq;
};

const isLevelSelectedNumber = (selection) => (level) => level >= selection;
const isLevelSelectedArray = (selection) => (level) => selection.includes(level);

const getTitle = (children) => children.filter((token) => token.type === 'text' || token.type === 'code_inline').reduce((acc, t) => acc + t.content, '');

const anchor = (md, opts) => {
    opts = Object.assign({}, anchor.defaults, opts);

    md.core.ruler.push('anchor', (state) => {
        const slugs = {};
        const tokens = state.tokens;

        const isLevelSelected = Array.isArray(opts.level) ? isLevelSelectedArray(opts.level) : isLevelSelectedNumber(opts.level);

        for (let i = 0; i < tokens.length; i++) {
            const currentLevel = tokens[i].markup.length;
            if (tokens[i].type === 'heading_open' && isLevelSelected(currentLevel)) {
                const titleIndex = i + 1;
                const currentTitle = getTitle(tokens[titleIndex].children);
                let prevTitle = tokens[i].attrGet('id');
                let constructedTitle = prevTitle;

                // Skip if user has defined a id
                if (typeof prevTitle !== 'string') {
                    if (prevTitle === null) {
                        prevTitle = [];
                    }

                    let recurIndex = i + 2;
                    while (recurIndex < tokens.length && (tokens[recurIndex].type !== 'heading_open' || tokens[recurIndex].markup.length > currentLevel)) {
                        if (tokens[recurIndex].type === 'heading_open') {
                            let recurPrevTitle = tokens[recurIndex].attrGet('id');
                            if (typeof recurPrevTitle !== 'string') {
                                if (recurPrevTitle === null) {
                                    recurPrevTitle = [];
                                }
                                recurPrevTitle = [...recurPrevTitle, currentTitle];
                                tokens[recurIndex].attrSet('id', recurPrevTitle);
                            }
                        }
                        recurIndex += 1;
                    }

                    prevTitle.push(currentTitle);
                    //console.log(prevTitle);

                    // @TODO maybe use previous slugified title so we don't need to calculate that much?
                    constructedTitle = prevTitle.join('-');
                    //console.log(constructedTitle);
                }

                const slug = uniqueSlug(opts.slugify(constructedTitle), slugs, true);
                tokens[i].attrSet('id', slug);

                if (opts.permalink) {
                    opts.renderPermalink(slug, opts, state, i);
                }

                if (opts.callback) {
                    opts.callback(tokens[i], { slug, constructedTitle });
                }
            }
        }
    });
};

anchor.defaults = {
    level: 1,
    slugify,
    permalink: false,
    renderPermalink,
    permalinkClass: 'header-anchor',
    permalinkSpace: true,
    permalinkSymbol: '¶',
    permalinkBefore: false,
    permalinkHref,
    permalinkAttrs,
};

module.exports = anchor;
