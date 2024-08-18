const express = require("express");
const {
  signup,
  login,
  logout,
  currentUser,
  updateUserSubscription,
  authMiddleware,
} = require("../../models/users");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", authMiddleware, logout);
router.get("/current", authMiddleware, currentUser);
router.patch("/", authMiddleware, updateUserSubscription);

module.exports = router;
