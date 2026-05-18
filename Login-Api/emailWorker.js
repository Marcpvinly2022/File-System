import {Worker} from 'bullmq';
import {bullconnect} from './utils/redisClient.js';
import nodemailer from 'nodemailer';

// Setup Nodemailer (Transporter)
const transporter = nodemailer.createTransport({
    service: 'gmail',                                // Forces internal global presets
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
   pool: true,              // Reuse open network channels
    maxConnections: 1,       // PERMANENT FIX: Open exactly 1 single TCP channel to Google
    maxMessages: 100,        // Send up to 100 emails before recycling the active pipe
    rateLimit: 1,            // PERMANENT FIX: Limit outbound traffic speed to 1 email per second
    tls: {
        rejectUnauthorized: false // Bypasses local antivirus/firewall proxy handshakes
    
    }
});

transporter.verify((error, success) => {
    if (error) console.error("❌ SMTP Error:", error.message);
    else console.log("🚀 Server SMTP Channel Authenticated and Online");
});

const emailWorker = new Worker('welcome-emails',async (job) =>{
    const {email, name, resetLink} = job.data
    switch(job.name){
      case 'send-email':{
      await transporter.sendMail({
      to:email,
      from: '"From Team Marc" <smayowa689@gmail.com>',
      subject:"welcome",
       text: `Hello ${name}, welcome to this team! We are excited to have you.`, 
      html:`
        <div
  style="
    background:#f4f4f4;
    padding:40px 20px;
    font-family:Arial,sans-serif;
  "
>

  <div
    style="
      max-width:600px;
      margin:auto;
      background:white;
      border-radius:12px;
      overflow:hidden;
      box-shadow:0 2px 10px rgba(0,0,0,0.1);
    "
  >

    <!-- Header -->
    <div
      style="
        background:#111827;
        padding:30px;
        text-align:center;
      "
    >
      <h1
        style="
          color:white;
          margin:0;
          font-size:28px;
        "
      >
        Welcome 🎉
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:40px">

      <h2
        style="
          color:#111827;
          margin-bottom:20px;
        "
      >
        Hello ${name},
      </h2>

      <p
        style="
          color:#4b5563;
          line-height:1.8;
          font-size:16px;
        "
      >
        Thank you for registering an account with us.
        We're excited to have you onboard.
      </p>

      <p
        style="
          color:#4b5563;
          line-height:1.8;
          font-size:16px;
        "
      >
        Your account has been successfully created and
        you can now enjoy all the features available on
        our platform.
      </p>

      <!-- Button -->
      <div style="margin-top:30px">

        <a
          href="https://ajfdata.vercel.app/Login"
          style="
            background:#111827;
            color:white;
            padding:14px 24px;
            text-decoration:none;
            border-radius:8px;
            display:inline-block;
            font-size:16px;
          "
        >
          Get Started
        </a>

      </div>

      <!-- Footer -->
      <div
        style="
          margin-top:50px;
          border-top:1px solid #e5e7eb;
          padding-top:20px;
        "
      >

        <p
          style="
            color:#9ca3af;
            font-size:14px;
            line-height:1.6;
          "
        >
          If you did not create this account,
          please ignore this email.
        </p>

      </div>

    </div>

  </div>

</div>
      `
          })
          break;
      }
      case "reset-password":{
         await transporter.sendMail({
                to: email,
                from: '"My App Security" <Smayowa689@gmail.com>',
                subject: "Reset your password 🔒",
                text: `Click here to reset: ${resetLink}`,
                html: `<h3>Security Alert</h3><p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
            });
            break;
      }
      default:
       console.warn(`⚠️ Unknown execution job signature received: ${job.name}`);
    }
    
  }, {connection: bullconnect});

emailWorker.on('completed', (job) => console.log(`✅ Queue Job ${job.id} completed successfully.`))
emailWorker.on('failed', (job, err) => console.error(`❌ Queue Job ${job?.id} failed out: ${err.message}`))