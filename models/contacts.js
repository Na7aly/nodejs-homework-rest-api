const mongoose = require("mongoose");

const contactsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

const Contact = mongoose.model("Contact", contactsSchema);

const listContacts = async (owner, page, limit, favorite, res) => {
  try {
    const query = { owner };
    if (favorite !== undefined) {
      query.favorite = favorite === "true";
    }

    const contacts = await Contact.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

const getContactById = async (owner, res, contactId) => {
  try {
    const contact = await Contact.findOne({ _id: contactId, owner });

    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(contact);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

const addContact = async (owner, res, body) => {
  try {
    const contact = new Contact({ ...body, owner });
    await contact.save();

    res.status(201).json(contact);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

const removeContact = async (owner, res, contactId) => {
  try {
    const contact = await Contact.findOneAndDelete({ _id: contactId, owner });

    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json({ message: "Contact deleted" });
  } catch (err) {
    res.status(500).send("Server error");
  }
};

const updateContact = async (owner, res, body, contactId) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: contactId, owner },
      { ...body },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(contact);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

const updateStatusContact = async (owner, res, body, contactId) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { _id: contactId, owner },
      { favorite: body.favorite },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: "Not found" });
    }

    res.status(200).json(contact);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

module.exports = {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateStatusContact,
};
