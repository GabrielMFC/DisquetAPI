const express = require('express')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const ffmpegPath = require("ffmpeg-static")

const cors = require('cors')
app.use(cors())

const app = express()
app.use(express.json())

const ytDlp = require('yt-dlp-exec')

await ytDlp(url, {
  extractAudio: true,
  audioFormat: 'mp3',
  output: path.join(downloadsDir, '%(title)s.%(ext)s')
})

app.post('/download', (req, res) => {
    const { url } = req.body
    if (!url) return res.status(400).json({ error: 'URL required' })

    const output = path.join(__dirname, 'downloads', '%(title)s.%(ext)s')
    const ytDlpPath = path.join(__dirname, 'yt-api', 'bin', 'yt-dlp')

    const ytDlp = spawn(ytDlpPath, [
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

app.listen(3000, () => {
  console.log('API running on port 3000')
})