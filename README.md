# 🌟 Files Manager: The Ultimate Backend Journey 🌟

### Curriculum: Short Specialization

#### Dive Into Cutting-Edge Technologies:

- **Back-end Magic**: Node.js, Express.js, ES6, MongoDB, Redis, Kue, and More!
- **Modern JavaScript**: Embrace the elegance and power of ES6.
- **NoSQL Databases**: Master MongoDB & Redis for lightning-fast data management.
- **Real-time Processing**: Supercharge your backend with Kue.

## 🌍 Project Overview: Your Gateway to Mastery

Welcome to the **Files Manager** project—a culmination of your backend expertise, where you'll craft a sleek and efficient platform that handles file management with finesse.

### 🌟 Key Features:

- **🔐 Token-Based Authentication**: Secure and streamlined user authentication.
- **📂 File Listing**: Display all your files with style and efficiency.
- **⬆️ File Uploading**: Seamlessly add new files to your collection.
- **🔧 Permission Management**: Control who gets to see what with fine-tuned permission settings.
- **🖼️ File Viewing**: Access and view files with a click.
- **🖼️ Thumbnail Generation**: Automatically create stunning thumbnails for your images.

### 🚀 The Objective:

Take the lessons you've learned on authentication, Node.js, MongoDB, Redis, pagination, and background processing, and channel them into creating a robust file management platform that’s as functional as it is elegant.

## 📚 Resources: Fuel for Your Journey

Sharpen your skills and expand your knowledge with these invaluable resources:

- 🌐 [Node.js: The Definitive Guide](https://www.nodejs.org/en/docs/guides/getting-started-guide/)
- 🚀 [Process API Docs](https://www.node.readthedocs.io/en/latest/api/process/)
- 🛠️ [Express.js: Quick Start](https://www.expressjs.com/en/starter/installing.html)
- 🔍 [Mocha: The Testing Framework](https://www.mochajs.org)
- 🔄 [Nodemon: Continuous Development](https://www.github.com/remy/nodemon#nodemon)
- 📦 [MongoDB: The Official Driver](https://www.github.com/mongodb/node-mongodb-native)
- 📈 [Bull: Robust Queue System](https://www.github.com/OptimalBits/bull)
- 🖼️ [Image Thumbnail Generator](https://www.npmjs.com/package/image-thumbnail)
- 🔍 [Mime-Types: File Identification](https://www.npmjs.com/package/mime-types)
- ⚡ [Redis: The In-Memory Data Store](https://www.github.com/redis/node-redis)

## 🔧 Requirements: Your Toolkit for Success

Make sure your development environment is set up with the following:

- Preferred editors: `vi`, `vim`, `emacs`, `Visual Studio Code`
- Execute on: Ubuntu 18.04 LTS using `Node.js` (version 12.x.x)
- Code guidelines:
  - All files should end with a newline.
  - Include a comprehensive `README.md` file.
  - JavaScript files should use the `.js` extension.
  - Adhere to ESLint standards to maintain clean, error-free code.

## 📦 Provided Files: The Blueprint of Your Project

### `package.json`

Your project’s lifeline—managing dependencies, scripts, and project metadata. Before you dive in, remember to run `$ npm install` to set up everything.

<details>
  <summary>Click to reveal the package.json file contents</summary>

```json
{
  "name": "files_manager",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "lint": "./node_modules/.bin/eslint",
    "check-lint": "lint [0-9]*.js",
    "start-server": "nodemon --exec babel-node --presets @babel/preset-env ./server.js",
    "start-worker": "nodemon --exec babel-node --presets @babel/preset-env ./worker.js",
    "dev": "nodemon --exec babel-node --presets @babel/preset-env",
    "test": "./node_modules/.bin/mocha --require @babel/register --exit"
  },
  "license": "ISC",
  "dependencies": {
    "bull": "^3.16.0",
    "chai-http": "^4.3.0",
    "express": "^4.17.1",
    "image-thumbnail": "^1.0.10",
    "mime-types": "^2.1.27",
    "mongodb": "^3.5.9",
    "redis": "^2.8.0",
    "sha1": "^1.1.1",
    "uuid": "^8.0.0"
  },
  "devDependencies": {
    "@babel/cli": "^7.8.0",
    "@babel/core": "^7.8.0",
    "@babel/node": "^7.8.0",
    "@babel/preset-env": "^7.8.2",
    "@babel/register": "^7.8.0",
    "chai": "^4.2.0",
    "chai-http": "^4.3.0",
    "mocha": "^6.2.2",
    "nodemon": "^2.0.2",
    "eslint": "^6.4.0",
    "eslint-config-airbnb-base": "^14.0.0",
    "eslint-plugin-import": "^2.18.2",
    "eslint-plugin-jest": "^22.17.0",
    "request": "^2.88.0",
    "sinon": "^7.5.0"
  }
}
```

</details>

### `.eslintrc.js`

This configuration file is the guardian of code quality, enforcing best practices and ensuring your codebase remains immaculate.

<details>
  <summary>Click to reveal the .eslintrc.js file contents</summary>

```javascript
module.exports = {
  env: {
    browser: false,
    es6: true,
    jest: true,
  },
  extends: ["airbnb-base", "plugin:jest/all"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
  },
  plugins: ["jest"],
  rules: {
    "max-classes-per-file": "off",
    "no-underscore-dangle": "off",
    "no-console": "off",
    "no-shadow": "off",
    "no-restricted-syntax": ["error", "LabeledStatement", "WithStatement"],
  },
  overrides: [
    {
      files: ["*.js"],
      excludedFiles: "babel.config.js",
    },
  ],
};
```

</details>

### `babel.config.js`

The Babel configuration file—ensuring your modern JavaScript code is effortlessly compatible with Node.js.

<details>
  <summary>Click to reveal the babel.config.js file contents</summary>

```javascript
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
      },
    ],
  ],
};
```

</details>

---

Don’t forget to run `$ npm install` to set up your development environment. Ready to build something extraordinary? Let’s code!
