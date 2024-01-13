# MSc in ASE: Cloud Computing Applications - Group2 (Weekday Batch)

The application uses several AWS resources, including Lambda functions and an API Gateway API. These resources are defined in the `template.yaml` file in this project. You can update the template to add AWS resources through the same deployment process that updates your application code.

## Setup

#### Node Setup

- Node.js - [Install Node.js 18](https://nodejs.org/en/), including the NPM package management tool.

```bash
npm i
npm i -g tsc
```

#### Install SAM

- SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

After, configure AWS prfile with IAM redentials in your local machine

#### Optional

- Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)

## Deploy the sample application

The Serverless Application Model Command Line Interface (SAM CLI) is an extension of the AWS CLI that adds functionality for building and testing Lambda applications. It uses Docker to run your functions in an Amazon Linux environment that matches Lambda. It can also emulate your application's build environment and API.

```bash
sam build
```

If you using AWS account that is not default, use following in your shell:

```bash
sam deploy --profile={Your_AWS_Profile}
```

If you want to deploy into prod environment, use folloeing in your shell:

```bash
sam deploy --config-env=prod
```

The first command will build the source of your application. The second command will package and deploy your application to AWS, with a series of prompts:

You can find your API Gateway Endpoint URL in the output values displayed after deployment.

## Use the SAM CLI to build and test locally

Build your application with the `sam build` command.

```bash
sam build
```

## Unit tests

Tests are defined in the `/tests` folder in this project. Use NPM to install the [Jest test framework](https://jestjs.io/) and run unit tests.

```bash
npm install
npm run test
```

## Cleanup

To delete the sample application that you created, use the AWS CLI. Assuming you used your project name for the stack name, you can run the following:

```bash
aws cloudformation delete-stack --stack-name cloud-project
```

## Resources

See the [AWS SAM developer guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) for an introduction to SAM specification, the SAM CLI, and serverless application concepts.

Next, you can use AWS Serverless Application Repository to deploy ready to use Apps that go beyond hello world samples and learn how authors developed their applications: [AWS Serverless Application Repository main page](https://aws.amazon.com/serverless/serverlessrepo/)
