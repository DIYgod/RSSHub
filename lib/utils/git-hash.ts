import asyncGit from 'async-git';

let gitHash = process.env.HEROKU_SLUG_COMMIT?.slice(0, 8) || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8);
let gitDate: Date | undefined;
if (!gitHash) {
    try {
        gitHash = (await asyncGit.sha).slice(0, 8);
        gitDate = await asyncGit.date;
    } catch {
        gitHash = 'unknown';
    }
}

export { gitHash, gitDate };
