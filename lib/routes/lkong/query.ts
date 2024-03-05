// @ts-nocheck
module.exports = {
    viewForum: (id) => ({
        operationName: 'ViewForum',
        query:
            'query ViewForum($fid: Int!, $page: Int, $action: String) {' +
            '  forum(fid: $fid) {' +
            '    name' +
            '  }' +
            '  forumCount(fid: $fid) {' +
            '    info' +
            '  }' +
            '  hots: threadsFragment(fid: $fid, type: "hot") {' +
            '    tid' +
            '    title' +
            '  }' +
            '  threads(fid: $fid, action: $action, page: $page) {' +
            '    ...threadComponent' +
            '  }' +
            '}' +
            '' +
            'fragment threadComponent on Thread {' +
            '  tid' +
            '  title' +
            '}',
        variables: {
            fid: Number.parseInt(id),
        },
    }),
    viewThread: (id, page) => ({
        operationName: 'ViewThread',
        query:
            'query ViewThread($tid: Int!, $page: Int, $pid: String, $authorid: Int) {' +
            '  thread(tid: $tid, authorid: $authorid, pid: $pid) {' +
            '    ...threadComponent' +
            '  }' +
            '  ...repliesComponent' +
            '}' +
            '' +
            'fragment threadComponent on Thread {' +
            '  tid' +
            '  title' +
            '  dateline' +
            '  author {' +
            '    name' +
            '  }' +
            '  replies' +
            '  tags {' +
            '    name' +
            '  }' +
            '}' +
            '' +
            'fragment repliesComponent on Query {' +
            '  posts(tid: $tid, page: $page, pid: $pid, authorid: $authorid) {' +
            '    lou' +
            '    pid' +
            '    content' +
            '    quote {' +
            '      author {' +
            '        name' +
            '      }' +
            '      pid' +
            '      content' +
            '    }' +
            '    dateline' +
            '    user {' +
            '      name' +
            '    }' +
            '  }' +
            '}',
        variables: {
            tid: Number.parseInt(id),
            page,
        },
    }),
    countReplies: (id) => ({
        operationName: 'ViewThread',
        query: 'query ViewThread($tid: Int!){thread(tid: $tid){...threadComponent}}fragment threadComponent on Thread{replies}',
        variables: {
            tid: Number.parseInt(id),
        },
    }),
};
