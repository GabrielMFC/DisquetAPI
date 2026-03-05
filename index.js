const PORT = process.env.PORT || 3000
const HOST = "0.0.0.0"

const express = require('express')
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
const ffmpegPath = require("ffmpeg-static")

const app = express()
app.use(express.json())

const fs = require("fs")
try {
  console.log("Arquivos em /app:")
  console.log(fs.readdirSync("/app"))

  console.log("Arquivos em /app/yt-api/bin:")
  console.log(fs.readdirSync("/app/yt-api/bin"))
} catch (err) {
  console.error("Erro ao listar arquivos:", err.message)
}

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

app.listen(PORT, HOST, () => {
  console.log('API running on port 3000')
})