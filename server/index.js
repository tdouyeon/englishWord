const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Google Cloud Text-to-Speech 클라이언트 초기화
const client = new textToSpeech.TextToSpeechClient({
  keyFilename: './service-account.json', // 서비스 계정 키 파일 경로
});

app.post('/synthesize', async (req, res) => {
  const {text} = req.body;

  const request = {
    input: {text},
    voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
    audioConfig: {audioEncoding: 'MP3'},
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    // 오디오 데이터를 Buffer로 변환하여 응답
    const audioContent = response.audioContent;
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioContent.length, // 바이너리 데이터의 길이를 설정
    });
    res.end(Buffer.from(audioContent, 'binary')); // Buffer를 사용해 응답 전송
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

// 서버를 0.0.0.0에서 실행
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
