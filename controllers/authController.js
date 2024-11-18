const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Sign-up
exports.signUp = async (req, res) => {
  const { username, email, password, role } = req.body;
  
  // Check if email already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      email_verified: false, // Initially false
    });

    // Save the user to the database
    await newUser.save();

    // Send a verification email
    const verificationCode = crypto.randomBytes(20).toString('hex');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email here
        pass: process.env.EMAIL_PASS, // Your email password or App-specific password here
      },
    });

    const verificationUrl = `http://localhost:5000/api/auth/verify-email/${verificationCode}`;

    const mailOptions = {
      to: newUser.email,
      subject: 'Email Verification',
      text: `Please verify your email by clicking the following link: ${verificationUrl}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ message: 'Error sending email' });
      }
      res.status(201).json({ message: 'User created. Please verify your email' });
    });

    // Store the verification code in a safe location, e.g., in the database or memory (this is just an example).
    newUser.verificationCode = verificationCode;
    await newUser.save();
  } catch (error) {
    res.status(500).json({ message: 'Error signing up user', error });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if email is verified
    if (!user.email_verified) {
      return res.status(400).json({ message: 'Email not verified' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in user', error });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  const { verification_code } = req.params;

  try {
    const user = await User.findOne({ 'verificationCode': verification_code });
    if (!user) return res.status(400).json({ message: 'Invalid verification code' });

    user.email_verified = true;
    user.verificationCode = undefined; // Clear the verification code
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email', error });
  }
};
