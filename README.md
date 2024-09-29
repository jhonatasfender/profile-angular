# Perfis Project

This project is a web application developed with **Angular** for user profile management.

## Prerequisites

- **Node.js** (recommended minimum version: 20.x)
- **NPM** (Node Package Manager)

## Installing Node.js

1. Download and install Node.js from the official website: [Node.js](https://nodejs.org).
2. After installation, verify that Node.js and NPM are correctly installed by running the following commands:

   ```bash
   node -v
   npm -v
   ```

## Installing the Project

To set up the project locally, follow these steps:

1. Clone the project repository:

   ```bash
   git clone <REPOSITORY_URL>
   ```

2. Navigate to the project directory:

   ```bash
   cd project-perfis
   ```

3. Install the project dependencies:

   ```bash
   npm install
   ```

## Running the Application

To start the development server, run the following command:

```bash
npm start
```

The application will be accessible at `http://localhost:4200/`.

## Running Unit Tests

This project uses **Karma** and **Jasmine** for unit testing and code coverage.

To run the tests and generate a coverage report:

1. Execute the following command to run the unit tests:

   ```bash
   npm run test
   ```

2. After the tests finish, a coverage report will be generated in the `coverage/` directory.

3. To view the coverage report in your browser, run:

   ```bash
   npx live-server coverage/project-perfis/
   ```

4. Open the `index.html` file in your browser to see the detailed test coverage report.

### Current Test Coverage

A snapshot of the current test coverage is displayed below:

![Test Coverage Report](docs/img-01.png)

Additionally, here is a GIF demonstrating the execution of end-to-end (e2e) tests, highlighting how errors are detected. This showcases the project's commitment to quality, emphasizing faster delivery with a high level of confidence.

![E2E Test Execution](docs/img-02.gif)

## Project Structure

- **src/app**: Contains the core application components, services, and routing configuration.
- **src/assets**: Static assets, such as images and icons.
- **src/environments**: Environment-specific configuration files (e.g., for production and development environments).
