const https = require("https");

// Get the GitHub token from command line arguments
const token = process.argv[2];

if (!token) {
  console.error("Please provide a GitHub token as a command line argument");
  console.error("Usage: node github-repos.js <github_token>");
  process.exit(1);
}

const options = {
  hostname: "api.github.com",
  path: "/user/repos?per_page=100",
  method: "GET",
  headers: {
    "User-Agent": "Node.js GitHub Repos Counter",
    Authorization: `token ${token}`,
    Accept: "application/vnd.github.v3+json",
  },
};

const req = https.request(options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    if (res.statusCode === 200) {
      const repos = JSON.parse(data);
      console.log(`You have ${repos.length} repositories on GitHub.`);

      // Check if we need to paginate
      const linkHeader = res.headers.link;
      if (linkHeader && linkHeader.includes('rel="next"')) {
        console.log(
          "Note: You have more than 100 repositories. This script only counted the first 100."
        );
      }
    } else {
      console.error(`Error: ${res.statusCode}`);
      console.error(data);
    }
  });
});

req.on("error", (error) => {
  console.error(`Error: ${error.message}`);
});

req.end();
