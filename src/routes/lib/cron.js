import cron from "cron";
import https from "https";
import http from "http";

const job = new cron.CronJob("*/14 * * * * ", function(){
    // Use the API_URL environment variable for deployed URL, fallback to localhost for development
    const url = process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`;
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
        if(res.statusCode === 200){ 
            console.log("Cron job executed successfully");
        } else {
            console.log("Cron job failed", res.statusCode);
        }
    })
    .on("error", (e) => {
        console.log("Error while sending request to cron job", e);
    });
});

export default job;