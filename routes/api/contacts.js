const express = require("express");
const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
} = require("../../models/contacts");
const { authMiddleware } = require("../../models/users");

const router = express.Router();

router.use(authMiddleware);

router.get("/", (req, res) => {
  const { page = 1, limit = 20, favorite } = req.query;
  listContacts(req.user._id, page, limit, favorite, res);
});

router.get("/:contactId", (req, res) => {
  getContactById(req.user._id, res, req.params.contactId);
});

router.post("/", (req, res) => {
  addContact(req.user._id, res, req.body);
});

router.delete("/:contactId", (req, res) => {
  removeContact(req.user._id, res, req.params.contactId);
});

router.put("/:contactId", (req, res) => {
  updateContact(req.user._id, res, req.body, req.params.contactId);
});

router.patch("/:contactId/favorite", (req, res) => {
  updateStatusContact(req.user._id, res, req.body, req.params.contactId);
});

module.exports = router;
