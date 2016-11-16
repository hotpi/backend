[![Stories in Ready](https://badge.waffle.io/hotpi/backend.png?label=ready&title=Ready)](http://waffle.io/hotpi/backend)

# HotPi
HotPi is a web application for patient documentation, which ensures availability even if no connection is available at all without compromising the state of the application. If a connection is available in all devices, a Google-Docs-like workflow can be experienced. 

## Features
HotPi leverages the browsers' APIs to bring the following features:

- Real-time collaborative work
- Offline mode
- Interactive UI
- Support of mobile devices

## Requirements
A NodeJS instance is needed to fetch all the dependencies. If you don't have one, you can get it with [`nvm`](https://github.com/creationix/nvm) or directly on [NodeJS website](https://nodejs.org/en/).

## Technologies
HotPi's underlying technology to maintain consistency is [Operational Transformation](https://en.wikipedia.org/wiki/Operational_transformation)(OT). OT is also used to support real-time collaborative work.

On the server, an [Express.js](https://expressjs.com) server application is running to synchronize the state between all the clients, as well as keeping the only source of truth of the data. 

[MongoDB](https://www.mongodb.com) is used for the data storage.

## Installation

To fetch dependencies run
```
npm install 
```
on a terminal session.

## Usage
After the dependencies have been fetched run 
```
npm start
```
to run the development server.


