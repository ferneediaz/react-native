import cron from "cron";
import https from "https";

const job = new cron.CronJob("*/14 * * * * ", function(){
    https.get(process.env.API_URL, (res) => {
        if(res.statusCode === 200){ console.log("Cron job executed successfully");}
        else console.log("Cron job failed",res.statusCode);
    })
    .on("error", (e) => {
        console.log("Error while sending request to cron job",e);
    })
});



export default job;