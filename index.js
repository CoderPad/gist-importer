const { Octokit } = require("@octokit/core");
const fetch = require('node-fetch');

const octokit = new Octokit();

require("dotenv").config();

async function getGist() {
    const {data} = await octokit.request("GET /gists/{gist_id}", {
      gist_id: "004066b2225c7f1093c7e249cabfcdf5",
    });

    const {files} = data;

    // If one file, mark that as selected
    // If more than one file, ask which file to import

    console.log(files["index.rs"]);
}

const CODERPAD_KEY = process.env.CODERPAD_API;

async function main() {
    const url = "https://app.coderpad.io/api/pads?sort=updated_at,desc";

    const res = await fetch(url, {
        // method: "post",
        // body: JSON.stringify(body),
        headers: {
            "Authorization": `Token token="${CODERPAD_KEY}"`
         },
    })
    .then((res) => res.json())

    console.log(res);
}

main()
    .catch(console.error);