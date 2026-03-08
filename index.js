const PORT = process.env.PORT || 3000
const HOST = "0.0.0.0"
const fs = require("fs")
const express = require('express')
const { spawn } = require('child_process')
const path = require('path')
const ffmpegPath = require("ffmpeg-static")
const cors = require('cors');

const app = express()
app.use(express.json())
app.use(cors());
app.use(express.json());

app.post('/download', (req, res) => {
    const { url } = req.body
    if (!url) return res.status(400).json({ error: 'URL required' })

    const output = path.join(__dirname, 'downloads', '%(title)s.%(ext)s')
    const ytDlpPath = path.join(__dirname, 'yt-api', 'bin', 'yt-dlp')

    const ytDlp = spawn(ytDlpPath, [
        '--no-playlist',

        '--extractor-args',
        'youtube:player_client=android,ios,web',

        '--user-agent',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',

        '-f', '140/bestaudio/best',

        '-x',
        '--audio-format', 'mp3',

        '--ffmpeg-location', ffmpegPath,
        '-o', output,
        url
    ])

    ytDlp.stdout.on('data', data => console.log(data.toString()))
    ytDlp.stderr.on('data', data => console.error(data.toString()))

    ytDlp.on('close', (code) => {
    console.log('Process exited with code', code)

    fs.readdir('./downloads', (err, files) => {
        if (err || files.length === 0) return res.status(500).json({ error: 'File not found' })
            const filePath = path.join(__dirname, 'downloads', files[0])
            res.download(filePath, () => fs.unlinkSync(filePath))
        })
    })
})

app.listen(PORT, HOST, () => {
  console.log('API running on port 3000')
})