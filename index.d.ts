/**
 *
 * @overview Metrics Class
 *
 * The Metrics class records the most pertinent server metrics
 *
 */
/**
 * @class Metrics
 *
 */
declare class Metrics {
    /**
     * @private metrics variable types
     */
    private metrics;
    /**
     * @constructor Initializes the metric variable
     */
    constructor();
    /**
     * @method requestCount
     * @description Counts the number of requests made to server
     * @param path {string} the request path
     *
     */
    requestCount(path: string): void;
    /**
     * @method getMetrics
     * @description returns the current metrics
     * @return metrics
     */
    getMetrics(): {
        totalRequests: number;
        errors: {
            totalErrors: number;
            totalHTTPErrors: number;
        };
        uptime: string;
        throughput: number;
        responseTime: {
            responseTimes: number[];
            AverageResponseTimeMs: number;
            PeakResponseTimeMs: number;
        };
        resources: {
            processor: {
                model: string;
                threads: number;
                loadAverage: {};
            };
            RAM: {
                total: any;
                free: any;
            };
            diskSpace: {
                total: number;
                free: number;
            };
        };
    };
    /**
     * @method errorCount
     * @description Ads one to the count of total errors and if the error code is 500 then adds 1 to the count to for httpErrors
     * @param errorCode {number} the error code of the error that occured
     */
    errorCount(errorCode: number): void;
    /**
     * @method startRequestTimer
     * @description records the starting time of a request. Is used in conjunction with the latency method to determine latency of request
     * @return time in milliseconds
     */
    startRequestTimer(): number;
    /**
     * @method setPeakResponseTime
     * @description updates the peak response time if the current response time is greater than the one on record.
     * @param {number} latency the response time to be checked against current peak response time.
     */
    setPeakResponseTime(latency: number): void;
    /**
     * @method setAverageResponseTime
     * @description calculates and updatesthe average response time from the the most recent 100 entries
     */
    setAverageResponseTime(): void;
    /**
     * @method setResponseTimes
     * @description creates an array of 100 of the latest response times.
     * @param {number} latency The response time to be added to array
     */
    setResponseTimes(latency: number): void;
    /**
     * @method latency
     * @description calculates latency of request by subtracting current time from starting time
     * @param time {number} start time of request in milliseconds
     * @return latency in milliseconds
     */
    latency(time: number): number;
    /**
     * @method upTime
     * @description records total uptime by incrementing the uptime variable by 1 each second
     */
    upTime(): void;
    /**
     * @method throughput
     * @description calculates the amount of requests per second
     */
    throughput(): void;
    /**
     * @method checkDiskSpace
     * @description Checks the amount of free disk space
     * @return promise an object that contains the {free, used, total} amount of disk space
     */
    checkDiskSpace(): Promise<{
        total: number;
        free: number;
        used: number;
    }>;
    /**
     * @method checkCpu
     * @description Counts cpu cores and checks cpu load average
     */
    checkCpu(): void;
    /**
     * @method checkResources
     * @description Checks the available system resources, including Disk-space, Ram, Cpu, Cores
     */
    checkResource(): Promise<void>;
    /**
     * @method measure
     * @description measures and records the system metrics and performance. This method should be called right before or after the server response.
     * @param {number} startTime The start time in milliseconds measured at the start of a request.
     * @param {string} path The request path
     * @param {number} responseCode The code for the response eg.) 200, 300, 400, 500
     */
    measure(startTime: number, path: string, responseCode: number): void;
}
export declare const metrics: Metrics;
export {};
