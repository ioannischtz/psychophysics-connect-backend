# REMOTE-PSYCHOPHYSICS backend

[![License](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](https://opensource.org/licenses/GPL-3.0)
[![GitHub Stars](https://img.shields.io/github/stars/your-username/your-repo.svg)](https://github.com/ioannischtz/remote-psychophysics-backend/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/your-username/your-repo.svg)](https://github.com/ioannischtz/remote-psychophysics-backend/network/members)

Backend server for the `remote-psychophysics` app, built with Node.js,
Express.js, and MongoDB/Mongoose. This project provides JWT authentication for
secure endpoints and handles audio streaming.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Motivation](#motivation)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- Secure authentication using JWT.
- Audio streaming capabilities.
- Organized project structure with controllers, models, middleware, and more.
- Express.js for handling routes and requests.
- MongoDB/Mongoose for database management.

## Installation

1. Clone the repository.

   ```bash
   git clone https://github.com/ioannischtz/remote-psychophysics-backend.git
   ```

2. Install dependencies.

```bash
npm install
```

## Usage

1. Configure your environment variables. Create a .env file in the root
   directory and provide necessary configurations.

```env
NODE_ENV=development
PORT=3000
# Add other environment variables
```

2. Start the server

```bash
npm run start
```

3. Access the application in your browser or API client.

## Motivation

The inspiration behind this project stems from my previous original work named
`remote-timbre-experiment`, which served as a foundation for this enhanced
version. Originally developed as part of my PhD research, the
`remote-timbre-experiment` aimed to conduct psycho-physical experiments on sound
perception in a remote setting due to prevailing pandemic circumstances.

In the earlier iteration, the focus was on implementing a specific experiment,
allowing participants to manipulate image representations of sound
characteristics rather than relying on conventional word-pairs. While functional
for its intended purpose, the project was constrained by tight timelines and
lacked professional patterns and abstractions.

The motivation for this current project, hence, is to re-imagine and extend the
capabilities of the `remote-timbre-experiment` platform. By leveraging proper
software engineering practices, architectural patterns, and robust abstractions,
this project seeks to provide an adaptable platform for a variety of
psycho-physical experiments. The goal is to facilitate researchers in the field
with a versatile and user-friendly dashboard that can be tailored to different
experiments and sound perception studies.

Through enhancing the initial project and embracing professional techniques,
this project aims to empower researchers to conduct experiments more effectively
and efficiently, contributing to the advancement of psycho-physical research in
sound perception and related domains.

## API Documentation

The API endpoints and their usage are documented in the
[API Documentation](API_DOCS.md) file.

## Testing

To run tests, use the following commands:

- Run tests with coverage:

```bash
npm run test:coverage
```

- Run tests in watch mode:

```bash
npm run test:watch
```

- Run tests in ui mode:

```bash
npm run test:ui
```

## Contributing

Contributions are welcome! To contribute to this project:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Test your changes thoroughly.
5. Create a pull request.

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE). 
You are free to use, modify, and distribute the code as per the terms of this
license.

## Contact

- Ioannis-chtz: ioannischtz@gmail.com
- Project Link: https://github.com/ioannischtz/remote-psychophysics-backend
