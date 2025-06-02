const authService = require('../services/auth.service');

const login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const result = await authService.authenticateUser(email, password);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: result.user
      });
    } else {
      res.status(401).json({ success: false, message: result.message });
    }
  } catch (err) {
    console.error('Error during login:', err.stack);
    res.status(500).json({ success: false, message: 'An internal server error occurred during login.' });
  }
};

module.exports = {
  login
}; 