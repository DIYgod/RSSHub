import gitRevSync from 'git-rev-sync';

let gitHash = process.env.HEROKU_SLUG_COMMIT?.slice(0, 7) || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7);
if (!gitHash) {
    try {
        gitHash = gitRevSync.short();
    } catch {
        gitHash = 'unknown';
    }
}

export default gitHash;
