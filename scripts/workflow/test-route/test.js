module.exports = async ({github, context}, baseUrl, routes, number) => {
    if (res[0] === 'NOROUTE') {
        return
    }

    const links = res.map(e => {
        const l = e.startsWith('/') ? e : `/${e}`
        return `${baseUrl}${l}`
    })

    let com = 'Successfully generated as following:\n\n'

    for (lks in links) {
        const prev = await fetch(lks).catch(err => {
            com+= `
        <details>
            <summary>${lks}  - **Failed**</summary>

            \`\`\`
            ${err}
            \`\`\`
        </details>

`
        })
        if (prev) {
            com += `
<details>
    <summary>${lks}  - Success</summary>

    \`\`\`
    ${prev.text().split("\n").slice(0, 30).join("\n")}
    \`\`\`
</details>

`
        }
    }
    github.issues.addLabels({
        issue_number: number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        labels: ['Auto: Route Test Complete']
    })
    github.issues.createComment({
        issue_number: number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: com
    });
}