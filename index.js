const { Octokit } = require("@octokit/core");
const fetch = require("node-fetch");
const inquirer = require("inquirer");

require("dotenv").config();

const octokit = new Octokit();

/**
 * @typedef {Object} GistFile
 * @param {string} filename // EG 'evilAnswer.js'
 * @param {string} type // EG: 'application/javascript'
 * @param {string} language // EG: 'JavaScript'
 * @param {string} raw_url
 * @param {number} size
 * @param {boolean} truncated
 * @param {string} content
 */

/**
 * @returns {GistFile}
 */
async function getGist() {
  const gistRegex = /https:\/\/gist.github.com\/.*\/([0-9a-f]{32}$)/;

  const gistQ = await inquirer.prompt([
    {
      type: "input",
      name: "gist_url",
      message: "Enter the URL or ID for the Gist you want to import",
      validate: function (value) {
        var pass = value.match(gistRegex);
        if (pass) return true;
        
        const validId = value.match(/^[0-9a-f]{32}$/);
        if (validId) return true;

        return "Please enter a valid Gist URL or ID";
      },
    },
  ]);

  const gistURL = gistQ["gist_url"];

  let [_, gistId] = gistRegex.exec(gistURL) || [];

  if (!gistId) gistId = gistURL;

  const { data } = await octokit.request("GET /gists/{gist_id}", {
    gist_id: gistId,
  });

  const { files } = data;

  /**
   * @type {GistFile | null}
   */
  let selectedFile = null;

  const fileEntries = Object.entries(files);
  if (fileEntries.length === 1) {
    // The "value" of the first file
    selectedFile = fileEntries[0][1];
  } else if (fileEntries.length > 1) {
    const qAnswer = await inquirer.prompt([
      {
        type: "rawlist",
        name: "promptFile",
        message: "What file do you want to import?",
        choices: Object.keys(files),
      },
    ]);

    selectedFile = files[qAnswer["promptFile"]];
  } else {
    throw "There don't seem to be any files in this Gist to import";
  }

  return selectedFile;
}

const CODERPAD_KEY = process.env.CODERPAD_API;

/**
 * @param {GistFile} selectedFile
 */
async function getCoderPad(selectedFile) {
  const url = "https://app.coderpad.io/api/pads";

  const res = await fetch(url, {
    method: "post",
    body: JSON.stringify({
      // title: '',
      language: selectedFile["language"].toLowerCase(),
      contents: selectedFile["content"],
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token token="${CODERPAD_KEY}"`,
    },
  }).then((res) => res.json());

  console.log(res);
}

async function main() {
  const selectedFile = await getGist();
  await getCoderPad(selectedFile);
}

main().catch(console.error);
