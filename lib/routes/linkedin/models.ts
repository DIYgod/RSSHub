class Job {
    title: any;
    link: any;
    company: any;
    location: any;
    pubDate: any;
    recruiter: any;
    description: any;
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

export { Job };
