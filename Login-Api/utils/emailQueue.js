import { Queue } from "bullmq";
import dotenv from 'dotenv'
dotenv.config();
import { redisClient, bullconnect } from "./redisClient.js";

const emailQueue = new Queue('welcome-emails', { connection: bullconnect });
// sendwelcome email queu
 export async function sendWelcomeEmail(userData) {
    try{
        await emailQueue.add('send-email', {email:userData.email,name:userData.name},
             {
                attempts:3,
                backoff:{
                    type: "exponential",
                    delay: 2000
                }
             });
        console.log(`✅ Job added for ${userData.email}`);
    }
    catch(err){
        console.error(`❌ Failed to queue email job for ${userData.email}:`, err);
        throw err; // Escalate up to the controller layer
    }
}
//  reset password queue
export async function sendPasswordResetEmail(email, resetLink) {
    try{
        await emailQueue.add('reset-password', {email:email, resetLink:resetLink}, {
            attempts:3,
            backoff:{
                type: "fixed",
                delay: 1000
            }
        })
         console.log(`✅ Job added for reset password on ${email}`);
    }
    catch(err){
        console.error(`❌ Failed to queue reset password job for ${email}:`, err);
        throw err; // Escalate up to the controller layer
    }
}