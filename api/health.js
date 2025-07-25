export default function handler(req, res) {
  res.status(200).json({ 
    status: 'Backend server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    hasClaudeKey: !!(process.env.CLAUDE_API_KEY || process.env.VITE_CLAUDE_API_KEY)
  });
}