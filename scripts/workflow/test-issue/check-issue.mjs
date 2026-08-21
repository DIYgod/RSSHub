import remarkParse from 'remark-parse';
import { unified } from 'unified';

const rssBugLabel = 'RSS bug';
const rssEnhancementLabel = 'RSS enhancement';
const rssProposalLabel = 'RSS proposal';
const commentMarker = '<!-- check-issue -->';
const triageLabels = new Set([rssBugLabel, rssEnhancementLabel, rssProposalLabel]);

const bugReportTemplate = {
    en: ['Routes', 'Related documentation', 'What is expected?', 'What is actually happening?'],
    zh: ['路由地址', '相关文档', '预期是什么？', '实际发生了什么？'],
    docs: {
        en: 'https://github.com/DIYgod/RSSHub/blob/master/.github/ISSUE_TEMPLATE/bug_report_en.yml',
        zh: 'https://github.com/DIYgod/RSSHub/blob/master/.github/ISSUE_TEMPLATE/bug_report_zh.yml',
    },
};

const rssProposalTemplate = {
    en: ['Category', 'Website URL', 'What content should be included?'],
    zh: ['类型', '网站地址', '需要生成什么内容？'],
    docs: {
        en: 'https://github.com/DIYgod/RSSHub/blob/master/.github/ISSUE_TEMPLATE/rss_request_en.yml',
        zh: 'https://github.com/DIYgod/RSSHub/blob/master/.github/ISSUE_TEMPLATE/rss_request_zh.yml',
    },
};

const featureRequestTemplate = {
    en: ['What feature is it?', 'What problem does this feature solve?'],
    zh: ['这是一个什么样的功能？', '这个功能可以解决什么问题？'],
    docs: {
        en: 'https://github.com/DIYgod/RSSHub/blob/master/.github/ISSUE_TEMPLATE/feature_request_en.yml',
        zh: 'https://github.com/DIYgod/RSSHub/blob/master/.github/ISSUE_TEMPLATE/feature_request_zh.yml',
    },
};

async function alreadyCommented(github, issueFacts) {
    const comments = await github.paginate(github.rest.issues.listComments, { ...issueFacts, per_page: 100 });
    return comments.some((c) => c.body?.includes(commentMarker));
}

/**
 * @param {import('mdast').Node} node
 * @returns {string}
 */
function extractText(node) {
    return node.type === 'text' ? node.value : node.children.map((c) => extractText(c)).join('');
}

/**
 * @param {{ github: ReturnType<typeof import('@actions/github').getOctokit>, context: typeof import('@actions/github').context, core: typeof import('@actions/core') }} githubScript
 * @returns {Promise<boolean>} true if the issue is invalid, i.e. closed (or already closed) as not_planned, so downstream jobs should skip
 */
export default async function invalidIssue({ github, context, core }) {
    let issue = context.payload.issue;
    if (!issue) {
        core.info(`Fetching issue #${process.env.ISSUE_NUMBER} (workflow_dispatch)`);
        const { data } = await github.rest.issues.get({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: Number(process.env.ISSUE_NUMBER),
        });
        issue = data;
    }
    const issueFacts = {
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issue.number,
    };

    const labels = issue.labels.map((l) => l.name);
    core.debug(`labels: ${JSON.stringify(labels)}`);

    const matched = labels.find((l) => triageLabels.has(l));
    if (!matched) {
        if (await alreadyCommented(github, issueFacts)) {
            core.info('Already commented, skipping');
            return true;
        }
        core.info('No triage label found, closing as not planned');
        await github.rest.issues.createComment({
            ...issueFacts,
            body: `${commentMarker}\nThis issue was closed automatically because it bypasses the required template. Please open a new issue following the template.`,
        });
        await github.rest.issues.update({
            ...issueFacts,
            state: 'closed',
            state_reason: 'not_planned',
        });
        return true;
    }

    const ast = unified()
        .use(remarkParse)
        .parse(issue.body ?? '');
    const headings = new Set(ast.children.filter((n) => n.type === 'heading').map((n) => extractText(n).trim()));
    core.debug(`headings: ${JSON.stringify([...headings])}`);

    const ctx = { github, core, issueFacts, headings };

    switch (matched) {
        case rssBugLabel:
            return runHeadingCheck(ctx, 'bug report', bugReportTemplate);
        case rssProposalLabel:
            return runHeadingCheck(ctx, 'RSS proposal', rssProposalTemplate);
        case rssEnhancementLabel:
            return runHeadingCheck(ctx, 'feature request', featureRequestTemplate);
        // no default
    }
    return false;
}

async function runHeadingCheck({ github, core, issueFacts, headings }, templateName, template) {
    const enOk = template.en.every((h) => headings.has(h));
    const zhOk = template.zh.every((h) => headings.has(h));

    if (enOk || zhOk) {
        core.info(`${templateName} heading check passed`);
        return false;
    }

    const missingEn = template.en.filter((h) => !headings.has(h));
    const missingZh = template.zh.filter((h) => !headings.has(h));
    const missing = missingEn.length <= missingZh.length ? missingEn : missingZh;
    core.warning(`${templateName} heading check failed, missing: ${missing.join(', ')}`);

    if (await alreadyCommented(github, issueFacts)) {
        core.info(`${templateName} already commented, skipping`);
        return true;
    }

    await github.rest.issues.createComment({
        ...issueFacts,
        body: `${commentMarker}\nThis issue was closed automatically because it bypasses the required template. Please open a new issue following the template.`,
    });
    await github.rest.issues.update({
        ...issueFacts,
        state: 'closed',
        state_reason: 'not_planned',
    });
    return true;
}
