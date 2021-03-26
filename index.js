const { Octokit } = require("@octokit/core");

const octokit = new Octokit();

async function main() {
    const {data} = await octokit.request("GET /gists/{gist_id}", {
      gist_id: "004066b2225c7f1093c7e249cabfcdf5",
    });

    const {files} = data;

    // If one file, mark that as selected
    // If more than one file, ask which file to import

    console.log(files["index.rs"]);
}

main()
    .catch(console.error);