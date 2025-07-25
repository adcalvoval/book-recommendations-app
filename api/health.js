// Health check endpoint for Vercel
module.exports = function handler(req, res) {
  res.status(200).json({ 
    status: 'Backend server is running!',
    timestamp: new Date().toISOString()
  });
}