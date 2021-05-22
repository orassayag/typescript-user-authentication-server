# TypeScript User Authentication Server

Built in March 2019. A small Node.js and TypeScript project to demonstrate real time user authentication server using configurations of PM2.

## Getting Started

Clone the application to your computer.
Steps to view the solution:
1. Open server application on IDE (I use VSCode).
2. In the terminal: npm i.
3. In the terminal: npm start.
Happy testing! :)

Installation
============
npm i
sudo npm i -g pm2   <***  IMPORTANT:  use 'sudo' for this command.

Config before run
=================
config file: config.ts.

Running the server
==================
you can run the server in the following ways:

1. run under pm2 (process name: UATool).
   pm2 start node --name UATool server.

   some commands:
    * pm2 status.
    * pm2 logs - show console.log lines (CTRL+Z to exit logs).
    * pm2 restart UATool - restarts the UA (can also use: pm2 restart all).

2. run as regular process (no pm2).
   > nohup node server -a UATool & disown.

   explanation:
      nohup - keep the process when closing the SSH terminal with 'exit' (does not apply to the X button).
      -a UATool - just to give a name to the process - -a [NAME].
      disown - detaches the process, will keep the process even when closing the SSH terminal with X button.

Useful server apis in development (/log apis are better seen in postman)
========================================================================
/ping - returns server status.
/log/incoming - show incoming requests (no details).
/log/requests - show requests/responses with details.
/log/errors - show errors occurred.

### Prerequisites

You'll need to install VSCode, Node, and clone the application, and in the terminal run: npm i.

## Built With

* [Node.js](https://nodejs.org/en/) - The web framework used - Server side.

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Author

* **Or Assayag** - *Initial work* - [orassayag](https://github.com/orassayag)
* Or Assayag <orassayag@gmail.com>
* GitHub: https://github.com/orassayag
* StackOverFlow: https://stackoverflow.com/users/4442606/or-assayag?tab=profile
* LinkedIn: https://linkedin.com/in/orassayag

## License

This application has an UNLICENSED License.