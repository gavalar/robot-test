#!/usr/bin/env bash

// Guard against a couple of common issues with how this script gets executed.
const candidateSubmission = process.argv[2];
if (candidateSubmission === 'submission-true.zip') {
  console.log('Please ensure you use `--candidate=your-email-address`. Note the equals sign in that.');
  process.exit(1);
} else if (!candidateSubmission.match(/^submission-([^@]+@.+)\.zip$/)) {
  console.log(
    'This script is intended to be run as part of the submission process. Please refer to the README.md file for instructions'
  );
  process.exit(1);
}

console.log('Uploading your submission to Which? systems ...');

const fs = require('fs');
const submissionContents = fs.readFileSync(candidateSubmission);

const https = require('https');
const request = https.request(
  {
    host: 'api.interviews.internal.which.co.uk',
    path: '/submission',
    method: 'POST',
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `inline; filename="${encodeURIComponent(candidateSubmission)}"`,
      'Content-Length': submissionContents.length,
    },
  },
  (response) => {
    if (response.statusCode !== 200) {
      console.error(
        'The server reported a problem receiving your submission. Try again. If it continues please contact Which? via email.',
        response.statusCode
      );
      response.resume();
      return;
    }

    response.on('close', () => {
      console.log('The server abruptly closed the connection.');
    });
  }
);
request.shouldKeepAlive = false;
request.on('error', (error) => {
  console.error(
    'There was a problem uploading your submission. Try again. If it continues please contact Which? via email.',
    error.message
  );
});

request.write(submissionContents);
request.end();

console.log("Submission upload complete. Please let Which? know you've done this just in case!");
