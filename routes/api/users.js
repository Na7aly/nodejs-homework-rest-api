const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const Jimp = require('jimp');
const { signup, login, logout, currentUser, updateUserSubscription, authMiddleware } = require('../../models/users');

const router = express.Router();

const tempDir = path.join(__dirname, '../../tmp');
const avatarsDir = path.join(__dirname, '../../public/avatars');

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

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', authMiddleware, logout);
router.get('/current', authMiddleware, currentUser);
router.patch('/', authMiddleware, updateUserSubscription);
router.patch('/avatars', authMiddleware, upload.single('avatar'), updateAvatar);

module.exports = router;
