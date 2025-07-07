# 🤖 Robot Test

**Robot Test** is a modular TypeScript CLI tool that validates HTTP API responses against a structured set of expected results, defined in a simple JSON format.

It is designed as a lightweight testing utility for developers who want to automate simple assertions against a collection of endpoints — ideal for use in monitoring, smoke testing, or integration test scaffolding.

## ✨ Features

- ✅ Built with **TypeScript** and **object-oriented design** principles
- 🧪 Compares real API responses to expected results from a test suite JSON file
- 🔧 Supports configurable headers and payloads
- 🧱 Modular class structure for future extensibility (e.g. reporters, authentication, retries)
- 📦 Easy to run via CLI

## 📂 Example Test File (`robot-test-suite.json`)

```json
[
  {
    "name": "Check GitHub API",
    "url": "https://api.github.com",
    "method": "GET",
    "expected": {
      "status": 200
    }
  }
]
```

## 🚀 Usage
```bash
npm install
npx ts-node index.ts robot-test-suite.json
```

The script will:

Load the JSON test suite

Perform the API calls

Compare responses to expected values

Log results to the console

## 🧱 Structure & Design Goals
Written in TypeScript, using clear class structures (`RobotTest`, `HttpRequestHandler`) to separate concerns

Designed for easy expansion — e.g. you can add `expectBodyContains`, `retryOnFail`, or output reporters

Encapsulates HTTP logic, error handling, and result formatting

Aligned with CLI design patterns for future command parsing (e.g. `commander` or `yargs`)

## 🧭 Roadmap Ideas
 Add support for `POST`, `PUT`, and custom payloads

 Add assertion on response body / headers

 Output as JSON, TAP, or JUnit XML

 Integrate test runners or CI/CD workflows

## 👨‍💻 Author
Gavin Corbett – [LinkedIn](https://www.linkedin.com/in/gavcorbett/)

This project is part of an ongoing professional development initiative focused on exploring TypeScript, test automation, and modern developer tooling using object-oriented design.
