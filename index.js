const PORT = process.env.PORT || 3000
const HOST = "0.0.0.0"
const fs = require("fs")

if (process.env.YT_COOKIES) {
  const cookies = process.env.YT_COOKIES.replace(/\\n/g, "\n")
  fs.writeFileSync("cookies.txt", cookies)
}
console.log(fs.readFileSync("/app/cookies.txt","utf8"))
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


    const cookiesPath = path.join(process.cwd(), "cookies.txt")

    const ytDlp = spawn(ytDlpPath, [
    '--cookies', cookiesPath,
    '--user-agent', 'Mozilla/5.0',
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