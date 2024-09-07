const http = require('http');
const WebSocket = require('ws')
const express = require('express');
const fs = require('fs');
const path = require('path');

// Initialize express
const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


const csvFilePath = path.join(__dirname, 'chat_messages.csv');



function logMessageToCSV(sender, message) {
    const csvRow = `"${sender}","${message}"\n`;
    
    // Check if file exists and create the header if not
    if (!fs.existsSync(csvFilePath)) {
        const header = '"Sender","Message"\n';
        fs.writeFileSync(csvFilePath, header);
    }
    
    // Append the message to the CSV file
    fs.appendFile(csvFilePath, csvRow, (err) => {
        if (err) {
            console.error('Failed to log message to CSV:', err);
        } else {
            console.log('Message logged to CSV:', csvRow);
        }
    });
}



wss.on('connection',(ws)=>{
    console.log('connected');
    ws.on('message',(message)=>{
        console.log(`message received from chat1:${message}`);

        logMessageToCSV('Sender->    ', message);

        wss.clients.forEach((client)=>{
            if(client !== ws && client.readyState === WebSocket.OPEN){
                client.send(message.toString());  

                logMessageToCSV('Receiver->  ', message);
            }
        })

    })

})


const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});