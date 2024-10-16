import User from '../models/User.js';

import { sendVerificationEmail } from '../utils/sendEmail.js';

import { nanoid } from 'nanoid';

const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const verificationToken = nanoid();
    const user = await User.create({ email, password, verificationToken });

    
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: 'User registered. Please verify your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyUser = async (req, res) => {
  const { verificationToken } = req.params;

  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.verify = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({ message: 'Verification successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });

  }
};

const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verify) {
      return res.status(400).json({ message: 'Verification has already been passed' });
    }

   
    await sendVerificationEmail(email, user.verificationToken);
    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { registerUser, verifyUser, resendVerificationEmail };
