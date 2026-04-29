var fs = require('fs');
var http = require('http');

http.createServer(function (req, res) {
    //CREATE and  WRITE to it
    fs.writeFile('diary.txt', 'Day 1: I started learning Node js\n', function (err) {
        if (err) throw err;

        //read file 
        fs.readFile('diary.txt', 'utf8', function (err, firstData) {
            if (err) throw err;

             //append file
            fs.appendFile('diary.txt', 'Day 2: I learnt file system and it was a very interesting topic in node js\n', function (err) {
                if (err) throw err;

                
                fs.readFile('diary.txt', 'utf8', function (err, finalData) {
                    if (err) throw err;

                    res.writeHead(200, { "Content-Type": "text/html" });

                    res.write(`
                        <html>
                        <head>
                            <title>Diary System</title>

                            <!-- Fonts -->
                            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600&family=Roboto:wght@300;400&display=swap" rel="stylesheet">

                            <style>
                                :root {
    --primary: #202983;
    --primary-gradient: linear-gradient(135deg, #202983, #39429b);
    --secondary: #14696d;

    --surface: #f8f9fb;
    --surface-low: #f2f4f6;
    --surface-highest: #e0e3e5;
    --surface-lowest: #ffffff;

    --text: #191c1e;
}

/* Base */
body {
    margin: 0;
    background: var(--surface);
    font-family: 'Inter', 'Roboto', sans-serif;
    color: var(--text);
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
}

/* Container */
.container {
    padding: 48px;
    max-width: 900px;
    margin: auto;
}

/* Header (Display Typography) */
.header {
    background: var(--primary-gradient);
    color: white;
    padding: 28px;
    border-radius: 12px;

    font-family: 'Space Grotesk', 'Poppins', sans-serif;
    font-size: 32px;
    font-weight: 600;
    letter-spacing: -0.5px;
}

/* Section Titles */
h2 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 12px;
    letter-spacing: -0.2px;
}

/* Section wrapper */
.section {
    background: var(--surface-low);
    margin-top: 32px;
    padding: 28px;
    border-radius: 12px;
}

/* Card */
.card {
    background: var(--surface-lowest);
    padding: 22px;
    border-radius: 12px;

    font-size: 16px;
    line-height: 1.8;
    letter-spacing: 0.2px;
}

/* Diary text */
pre {
    margin: 0;
    white-space: pre-wrap;

    font-family: 'JetBrains Mono', monospace;
    font-size: 14.5px;
    line-height: 1.7;
    letter-spacing: 0.3px;
}

/* Smooth interaction */
.card:hover {
    transform: translateY(-2px);
    transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
                            </style>
                        </head>

                        <body>

                        <div class="container">

                            <div class="header">
                                📘 My Diary System
                            </div>

                            <div class="section">
                                <h2>First Read</h2>
                                <div class="card">
                                    <pre>${firstData}</pre>
                                </div>
                            </div>

                            <div class="section">
                                <h2>After Append</h2>
                                <div class="card">
                                    <pre>${finalData}</pre>
                                </div>
                            </div>

                        </div>

                        </body>
                        </html>
                    `);

                    res.end();
                });
            });
        });
    });

}).listen(8080);
console.log('server is running on port 8080')