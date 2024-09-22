const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const Jimp = require('jimp');

const usersSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  subscription: {
    type: String,
    enum: ['starter', 'pro', 'business'],
    default: 'starter',
  },
  token: {
    type: String,
    default: null,
  },
  avatarURL: {
    type: String,
  },
});

const User = mongoose.model('User', usersSchema);

const validateUser = (user) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(user);
};

const signup = async (req, res) => {
  const { error } = validateUser(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({ message: 'Email in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const avatarURL = gravatar.url(email, { s: '250', d: 'identicon' }, true);

    user = new User({
      email,
      password: hashedPassword,
      avatarURL,
    });

    await user.save();

    res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
      },
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const login = async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

    const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
    user.token = token;
    await user.save();

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
      },
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const logout = async (req, res) => {
  try {
    const user = req.user;
    user.token = null;
    await user.save();
    res.status(204).json();
  } catch (err) {
    res.status(500).send('Server error');
  }
};

const currentUser = async (req, res) => {
  const user = req.user;
  res.status(200).json({
    email: user.email,
    subscription: user.subscription,
    avatarURL: user.avatarURL,
  });
};

const updateUserSubscription = async (req, res) => {
  const { subscription } = req.body;

  if (!['starter', 'pro', 'business'].includes(subscription)) {
    return res.status(400).json({ message: 'Invalid subscription type' });
  }

  const user = req.user;
  user.subscription = subscription;
  await user.save();

  res.status(200).json({
    email: user.email,
    subscription: user.subscription,
  });
};


const tempDir = path.join(__dirname, 'tmp'); 
const avatarsDir = path.join(__dirname, 'public', 'avatars');

const storage = multer.diskStorage({
  destination: tempDir,
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${req.user._id}${extension}`);
  },
});

const upload = multer({ storage });


const updateAvatar = async (req, res) => {
  const { path: tempUpload, originalname } = req.file;
  const extension = path.extname(originalname);
  const avatarName = `${req.user._id}${extension}`;
  const resultUpload = path.join(avatarsDir, avatarName);

  try {
    const image = await Jimp.read(tempUpload);
    await image.resize(250, 250).writeAsync(resultUpload);
    await fs.unlink(tempUpload);

    const avatarURL = `/avatars/${avatarName}`;
    req.user.avatarURL = avatarURL;
    await req.user.save();

    res.status(200).json({ avatarURL });
  } catch (err) {
    await fs.unlink(tempUpload);
    res.status(500).send('Server error');
  }
};


const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'secretkey');
    const user = await User.findById(decoded.userId);

    if (!user || user.token !== token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized' });
  }
};

module.exports = {
  signup,
  login,
  logout,
  currentUser,
  updateUserSubscription,
  authMiddleware,
  upload,
  updateAvatar,
};
