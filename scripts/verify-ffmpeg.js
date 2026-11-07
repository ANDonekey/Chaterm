const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

if (process.platform !== 'win32') {
  console.log(`Skipping ffmpeg verification for non-Windows platform: ${process.platform}`)
  process.exit(0)
}

// Electron 45.2.1 (win32-x64) — matches CI-verified hash after the 43.4.1 -> 45.2.1 upgrade
const KNOWN_HASH = 'F035E9879A6D43519467A8D761D2EA643AC63ED89D448EAB9AAC86BC38C4809F'

const ffmpegPath = path.join(__dirname, '../node_modules/electron/dist/ffmpeg.dll')

console.log('Validating ffmpeg.dll integrity...')
console.log(`Target: ${ffmpegPath}`)

if (!fs.existsSync(ffmpegPath)) {
  console.error('❌ ffmpeg.dll not found at expected path!')
  process.exit(1)
}

try {
  const fileBuffer = fs.readFileSync(ffmpegPath)
  const hashSum = crypto.createHash('sha256')
  hashSum.update(fileBuffer)
  const hex = hashSum.digest('hex').toUpperCase()

  if (hex !== KNOWN_HASH) {
    console.error('❌ SECURITY ALERT: ffmpeg.dll hash mismatch!')
    console.error(`Expected: ${KNOWN_HASH}`)
    console.error(`Actual:   ${hex}`)
    console.error('\nPOSSIBLE CAUSES:')
    console.error('1. Electron version changed (update the hash in scripts/verify-ffmpeg.js)')
    console.error('2. File corruption')
    console.error('3. MALICIOUS TAMPERING (DLL Sideloading/Replacement)')
    process.exit(1)
  }

  console.log('✅ ffmpeg.dll integrity check passed.')
  process.exit(0)
} catch (error) {
  console.error('❌ Error reading file:', error)
  process.exit(1)
}
