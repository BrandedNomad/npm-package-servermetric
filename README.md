@brandednomad/servermetric
==
The Servermetric package records and displays server metrics via the /healthz or /metrics endpoint. NOTE: This package is still under development

## Installation

Requires __npm 2.7.0__ or higher

`npm init`

`npm install @brandednomad/servermetric --save`

***

## Usage

Note the metrics.startRequestTimer() and metrics.measure() methods need to be added to each endpoint. The metrics.startRequestTimer() method is added at the start of a request and the metrics.measure() method is added after each response

    const metrics = require("@brandednomad/servermetric");
    
    server.get('/',(req,res)=>{
        const startTime = metrics.startRequestTimer()
        res.status(200).send('Hello World');
        metrics.measure(startTime,'homePage',200)
    })

    server.get('/metrics',(req,res)=>{
        res.status(200).send(metrics.getMetrics())
    })

***

## Methods

### object.startRequestTimer()

Calculates and returns the start time of a request

### object.measure()

Records the performance of a request.

It takes the return value of the startRequestTimer() method as an argument

### object.getMetrics()

Returns an metrics object that contains all the recorded metrics


***

## Testing

To test, go to the root folder and type 

`npm test`

***

## Repo(s)

* [github.com/brandednomad/npm-package-servermetric.git](https://github.com/BrandedNomad/npm-package-servermetric.git)

***

## contributing

Contributions not accepted at this moment

## Version History


#### Version 0.1.0

* initial release
