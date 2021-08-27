/**
 *
 * @overview Metrics Class
 *
 * The Metrics class records the most pertinent server metrics
 *
 */

import os from "os";
import childProcess from "child_process"

/**
 * @class Metrics
 *
 */
class Metrics {

    //todo add data in and data out

    /**
     * @private metrics variable types
     */
    private metrics: {
        totalRequests:number,
        errors:{
            totalErrors:number,
            totalHTTPErrors:number, //returns the count of internal server errors 500
        }
        uptime:string,
        throughput:number, //request per second
        responseTime:{
            responseTimes: number[],
            AverageResponseTimeMs:number, //average response time: total response time / number of responses
            PeakResponseTimeMs:number, //peak response time: longest response times
        },
        resources:{
            processor:{
                model:string,
                threads:number,
                loadAverage:{}
            },
            RAM:{
                total: number | any,
                free: number | any
            },
            diskSpace:{
                total: number
                free: number
            } //how many concurrent requests are being handled
        }
    }

    /**
     * @constructor Initializes the metric variable
     */
    constructor() {
        this.metrics = {
            totalRequests:0,
            errors:{
                totalErrors:0,
                totalHTTPErrors:0, //returns the count of internal server errors 500
            },
            uptime:"0", // uptime in milliseconds
            throughput:0, //request per second
            responseTime:{
                responseTimes:[],
                AverageResponseTimeMs:0, //average response time: total response time / number of responses
                PeakResponseTimeMs:0, //peak response time: longest response times
            },
            resources:{
                processor:{
                    model:'N/A',
                    threads:0,
                    loadAverage:{}
                },
                RAM:{
                    total: parseInt((os.totalmem() / 1024 / 1024 / 1024).toFixed(2)),
                    free: 0,
                },
                diskSpace:{
                    total: 0,
                    free: 0
                }


            }
        }
    }


    /**
     * @method requestCount
     * @description Counts the number of requests made to server
     * @param path {string} the request path
     *
     */
    requestCount(path:string){
        this.metrics.totalRequests += 1;

    }

    /**
     * @method getMetrics
     * @description returns the current metrics
     * @return metrics
     */
    getMetrics(){
        return this.metrics
    }


    /**
     * @method errorCount
     * @description Ads one to the count of total errors and if the error code is 500 then adds 1 to the count to for httpErrors
     * @param errorCode {number} the error code of the error that occured
     */
    errorCount(errorCode:number ):void{
        this.metrics.errors.totalErrors += 1;

        if(errorCode >= 500){
            this.metrics.errors.totalHTTPErrors += 1
        }
    }

    /**
     * @method startRequestTimer
     * @description records the starting time of a request. Is used in conjunction with the latency method to determine latency of request
     * @return time in milliseconds
     */
    startRequestTimer():number{
        return new Date().getTime()
    }

    /**
     * @method setPeakResponseTime
     * @description updates the peak response time if the current response time is greater than the one on record.
     * @param {number} latency the response time to be checked against current peak response time.
     */
    setPeakResponseTime(latency:number){
        if(this.metrics.responseTime.PeakResponseTimeMs < latency){
            this.metrics.responseTime.PeakResponseTimeMs = latency
        }
    }

    /**
     * @method setAverageResponseTime
     * @description calculates and updatesthe average response time from the the most recent 100 entries
     */
    setAverageResponseTime(){
        const responseTimeLength = this.metrics.responseTime.responseTimes.length
        const sumOfResponseTimes = this.metrics.responseTime.responseTimes.reduce((a,b)=> a + b)
        const averageResponseTime = sumOfResponseTimes / responseTimeLength > 0 ? sumOfResponseTimes / responseTimeLength : 0
        this.metrics.responseTime.AverageResponseTimeMs = averageResponseTime
    }

    /**
     * @method setResponseTimes
     * @description creates an array of 100 of the latest response times.
     * @param {number} latency The response time to be added to array
     */
    setResponseTimes(latency:number){
        if(this.metrics.responseTime.responseTimes.length < 10){
            this.metrics.responseTime.responseTimes.push(latency)
        }else{
            this.metrics.responseTime.responseTimes.shift()
            this.metrics.responseTime.responseTimes.push(latency)
        }
    }

    /**
     * @method latency
     * @description calculates latency of request by subtracting current time from starting time
     * @param time {number} start time of request in milliseconds
     * @return latency in milliseconds
     */
    latency(time:number){
        const endTime = new Date().getTime()
        const latency = endTime - time
        this.setResponseTimes(latency)
        this.setPeakResponseTime(latency)
        this.setAverageResponseTime()
        return latency
    }

    /**
     * @method upTime
     * @description records total uptime by incrementing the uptime variable by 1 each second
     */
    upTime() {
        let seconds = Math.floor(process.uptime())
        let minutes = Math.floor((seconds / 60));
        let hours = Math.floor((seconds / (60 * 60)));
        let days = Math.floor((seconds / (60 * 60 * 24)));
        let weeks = Math.floor((seconds / (60 * 60 * 24 * 7)))
        let months = Math.floor((seconds / (60 * 60 * 24 * 30.5) ))
        let years = Math.floor((seconds / (60 * 60 * 24 * 52) ))

        if (seconds >= 60){
            let m = Math.floor(seconds / 60)
            seconds = seconds  - (m * 60 )
        }

        if(minutes >= 60){
            let h = Math.floor(minutes / 60)
            minutes = minutes - (h * 60)
        }

        if(hours >= 24){
            let d = Math.floor(hours / 24)
            hours = hours - (d * 24)
        }

        if(days >= 31){
            let w = Math.floor(days/ 31)
            days = days - (w * 31)
        }

        if(months >= 12){
            let y = Math.floor(days/ 12)
            months = months - (y * 12)
        }


        this.metrics.uptime = `${years} Years, ${months} Months, ${days} Days, ${hours} Hours, ${minutes} Min, ${seconds} Sec`
    }

    /**
     * @method throughput
     * @description calculates the amount of requests per second
     */
    throughput(){
        this.metrics.throughput = this.metrics.totalRequests / (process.uptime() * 1000)
    }

    /**
     * @method checkDiskSpace
     * @description Checks the amount of free disk space
     * @return promise an object that contains the {free, used, total} amount of disk space
     */
    checkDiskSpace():Promise<{ total: number, free: number, used: number }>{


        return new Promise((resolve,reject)=>{

            let total = 0;
            let used = 0;
            let free = 0;
            let operatingSystem = process.platform

            if(operatingSystem === 'linux'){

                try{
                    childProcess.exec('df -k', function(error, stdout, stderr) {

                        let lines = stdout.split("\n");
                        let str_disk_info: any = lines[1].replace( /[\s\n\r]+/g,' ');
                        let disk_info: any = str_disk_info.split(' ');

                        total = Math.ceil((disk_info[1] * 1024)/ Math.pow(1024,2));
                        used = Math.ceil(disk_info[2] * 1024 / Math.pow(1024,2));
                        free = Math.ceil(disk_info[3] * 1024 / Math.pow(1024,2));

                        resolve({total, free, used})
                    });
                }catch(error){
                    console.log(error)
                }

            }else if(operatingSystem === 'win32'){

                try{
                    childProcess.exec('wmic logicaldisk get freespace', (error,stdout,stderror)=>{
                        let lines = stdout.split("\n");
                        const output = lines.map((item)=>{
                            return item.replace(/[\s\n\r]+/,'')
                        });
                        const hd = parseInt(output[1]);
                        free = Math.floor(hd / 1024 / 1024 / 1024)

                        resolve({total, free, used})
                    })

                }catch(error){
                    console.log(error)
                }

            }
        })
    }

    /**
     * @method checkCpu
     * @description Counts cpu cores and checks cpu load average
     */
    checkCpu(){
        const loads = os.loadavg()
        let cpu = {
            one:loads[0],
            two: loads[1],
            three: loads[2]
        }
        this.metrics.resources.processor.loadAverage = cpu;
        this.metrics.resources.processor.threads = os.cpus().length;
    }

    /**
     * @method checkResources
     * @description Checks the available system resources, including Disk-space, Ram, Cpu, Cores
     */
    async checkResource(){
        this.metrics.resources.RAM.free = parseInt((os.freemem() / 1024 / 1024 /1024).toFixed(2));
        const modelList = os.cpus()
        const model = modelList[0].model
        this.metrics.resources.processor.model = model
        let hd:{total:number,free:number,used:number} = await this.checkDiskSpace()
        this.metrics.resources.diskSpace.total = hd.total
        this.metrics.resources.diskSpace.free = hd.free
        this.checkCpu()


    }

    /**
     * @method measure
     * @description measures and records the system metrics and performance. This method should be called right before or after the server response.
     * @param {number} startTime The start time in milliseconds measured at the start of a request.
     * @param {string} path The request path
     * @param {number} responseCode The code for the response eg.) 200, 300, 400, 500
     */
    measure(startTime:number,path:string, responseCode:number){
        this.latency(startTime)
        this.upTime()
        this.throughput()
        this.checkResource()
        this.requestCount(path)
        if(responseCode >= 300){
            this.errorCount(responseCode)
        }
    }

}



export const metrics = new Metrics()

