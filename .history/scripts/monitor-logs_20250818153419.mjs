import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🔍 Monitoring development server logs...')
console.log('📡 Server should be running on http://localhost:3000')
console.log('💳 Try making a payment to see the logs...')
console.log('')

// Start the development server if not already running
const devProcess = spawn('npm', ['run', 'dev'], {
  cwd: join(__dirname, '..'),
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true
})

// Monitor stdout (normal logs)
devProcess.stdout.on('data', (data) => {
  const output = data.toString()
  console.log('📋 [STDOUT]', output.trim())
})

// Monitor stderr (error logs)
devProcess.stderr.on('data', (data) => {
  const output = data.toString()
  console.log('❌ [STDERR]', output.trim())
})

// Handle process exit
devProcess.on('close', (code) => {
  console.log(`🔚 Development server exited with code ${code}`)
})

// Handle process errors
devProcess.on('error', (error) => {
  console.error('💥 Failed to start development server:', error)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...')
  devProcess.kill('SIGINT')
  process.exit(0)
})

console.log('✅ Log monitoring started. Press Ctrl+C to stop.')
