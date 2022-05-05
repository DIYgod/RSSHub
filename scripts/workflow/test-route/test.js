/* eslint-disable */

module.exports = async ({ github, context, core, got }, baseUrl, routes, number) => {
    if (routes[0] === 'NOROUTE') {
        return;
    }

    const links = routes.map((e) => {
        const l = e.startsWith('/') ? e : `/${e}`;
        return `${baseUrl}${l}`;
    });

    let com = `Successfully [generated](https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}) as following:\n\n`;

    for (const lks of links) {
        core.info(`testing route:  ${lks}`);
        // Intended, one at a time
        const res = await got(lks).catch((err) => {
            let errMsg = err.toString();
            const errInfoList = err.response && err.response.body && err.response.body.match(/(?<=<pre class="message">)(.+?)(?=<\/pre>)/gs);
            if (errInfoList) {
                errMsg += '\n\n';
                errMsg += errInfoList
                    .slice(0, 3)
                    .map((e) => e.trim())
                    .join('\n');
            }
            com += `
<details>
    <summary><a href="${lks}">${lks}</a> - <b>Failed</b></summary>

\`\`\`
${errMsg}
\`\`\`
</details>

`;
        });
        if (res && res.body) {
            const { body } = res;
            com += `
<details>
    <summary><a href="${lks}">${lks}</a> - Success</summary>

\`\`\`rss
${body.replace(/\s+(\n|$)/g, '\n')}
\`\`\`
</details>

`;
        }
    }
    github.rest.issues
        .addLabels({
            issue_number: number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            labels: ['Auto: Route Test Complete'],
        })
        .catch((e) => {
            core.warning(e);
        });
    github.rest.issues
        .createComment({
            issue_number: number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: com,
        })
        .catch((e) => {
            core.warning(e);
        });
};
