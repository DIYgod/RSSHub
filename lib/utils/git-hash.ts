import gitRevSync from 'git-rev-sync';

let gitHash = process.env.HEROKU_SLUG_COMMIT?.slice(0, 8) || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8);
let gitDate: Date | undefined;
if (!gitHash) {
    try {
        gitHash = gitRevSync.short(undefined, 8);
        gitDate = gitRevSync.date();
    } catch {
        gitHash = 'unknown';
    }
}

export { gitHash, gitDate };
