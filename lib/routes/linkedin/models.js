class Job {
    constructor(title, link, company, location, pubDate, recruiter, description) {
        this.title = title;
        this.link = link;
        this.company = company;
        this.location = location;
        this.pubDate = pubDate;
        this.recruiter = recruiter;
        this.description = description;
    }
}

module.exports = {
    Job,
};
