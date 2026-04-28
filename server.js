const express = require('express');
const axios = require('axios');
const fs = require('fs');

const app = express();
app.use(express.json());

const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

app.post('/webhook', async (req, res) => {
  const events = req.body.events;

  for (let event of events) {
    if (event.type === 'message' && event.message.type === 'file') {
      const messageId = event.message.id;

      try {
        const response = await axios.get(
          `https://api-data.line.me/v2/bot/message/${messageId}/content`,
          {
            responseType: 'stream',
            headers: {
              Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`
            }
          }
        );

        const filePath = `./${Date.now()}_${event.message.fileName}`;
        const writer = fs.createWriteStream(filePath);

        response.data.pipe(writer);

        writer.on('finish', () => {
          console.log('File saved:', filePath);
        });

      } catch (err) {
        console.error(err);
      }
    }
  }

  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.send('Bot is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});
