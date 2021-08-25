# Nota
![nota](docs/images/nota_logo.png)

![Build](https://github.com/DeNA/nota/actions/workflows/test.yml/badge.svg)

Nota is a web application that allows to label and annotate images and videos for use in machine learning. It was created by [DeNA Co., Ltd](https://dena.com) in 2017. It was realeased as Open Source in March 2021.

- Multiple backends for images and video sources
  - Local Filesystem (mainly used for development)
  - S3 bucket
- Customizable annotations using JSON templating language
  - Points, binding boxes, polygon annotation in images
  - Timestamp event labeling for videos
  - Text input, boolean, single/multiple selection labeling for each item
- Management
  - Authentication using SAML
  - Multiple project support
    - Permissions by project
    - Multiple tasks by project
  - User privileges (Nota administrator/Project administrator/Annotator)
  - Task assignment
  - Reports
- Customizable input/output formats
  - custom json format is default

You can find more details about the motivations and capabilities in this article published in 2020: [English](https://engineer.dena.com/en/posts/2020.06/dena-annotation-system-for-machine-learning/) / [日本語](https://engineer.dena.com/posts/2020.06/dena-annotation-system-for-machine-learning/)

- [Getting started](#getting-started)
  - [Requirements](#requirements)
- [Setup & Run for development via Docker Compose](#setup--run-for-development-via-docker-compose)
  - [Run Server and Client](#run-server-and-client)
  - [Setup Database](#setup-database)
    - [Add seed data](#add-seed-data)
  - [Create new local user / Change local user password](#create-new-local-user--change-local-user-password)
  - [Run Tests](#run-tests)
- [Limitations](#limitations)
- [Documentation](#documentation)
- [FAQ](#faq)

## Getting started

These are the instructions for running Nota using Docker Compose for development. Instructions for production are similar and will be provided in the future.

### Requirements

- node >= 10.x
- MySQL >= 5.7
- redis >= 5.0

## Setup & Run for development via Docker Compose

### Run Server and Client

```shellsession
$ docker-compose up
```

Application will run on `localhost:3000` by default

Default user is created with username `admin` and password `admin`

### Setup Database

Only required the first time

```shellsession
$ docker-compose exec app npm run resetdb
```

#### Add seed data

```shellsession
$ docker-compose exec app npm run seed
```

### Create new local user / Change local user password

There is no local user creation UI, but local users can be added/updated by running the following script:

```shellsession
$ docker-compose exec app npm run createLocalUser
```

After a user is created, an administrator can manage all the users from the UI.

### Run Tests

- All tests `npm run test`
- Server tests `npm run test:server`
- Client tests `npm run test:client`

## Limitations

- Application text is not yet localized. Some text appears in Japanese.
- No Local User management UI. We use SAML authentication, and local users have only beed used for development so no UI for user creation, password change, etc exists. It is possible to create local users using the script noted above.
- No local filesystem source setup UI. We use mainly S3 as the backend for our images and videos, and local filesystem is only used for development and test. Seed data provides an already setup local filesystem path (`packages/nota-server/testfiles`) with some dummy files for development and testing. It is possible to add local sources directly into the database.

## Documentation

We plan to move the documentation into this repository in the future.

## FAQ

- Why did you open source nota?

  - When we first decided to develop our own solution, one of the reasons was that we were not able to find a suitable open source or commercial solution. By open sourcing it we hope that it can benefit others in the creation of quality annotated data.

- Can you add xyz annotation or labeling, or xyz feature?
  - We develop Nota for the machine learning needs we have, so we might not be able to allocate resources for every feature request. But you are encouraged to open an issue and also to collaborate with new features. The code is designed to be as plugin-like and it's relatively easy to add new annotation tipes, input/output formats, etc. Normally all non-breaking improvements and new features are welcome. If you have an idea that might require breaking changes, please open an issue and we can try to find a solution!
