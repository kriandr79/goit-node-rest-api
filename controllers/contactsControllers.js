import Contact from "../models/contacts.js";
import HttpError from "../helpers/HttpError.js";

export const getAllContacts = async (req, res) => {
  try {
    const owner = req.user.id;
    const { page = 1, limit = 2, favorite = false } = req.query;
    const skip = (page - 1) * limit;

    const allcontacts = await Contact.find({ owner, favorite }, "", {
      skip,
      limit,
    });

    res.json(allcontacts);
  } catch (error) {
    next(error);
  }
};

export const getOneContact = async (req, res, next) => {
  try {
    const owner = req.user.id;
    const { id } = req.params;
    const contact = await Contact.findOne(id);

    if (!contact) {
      throw HttpError(404, "Not found");
    }

    if (contact.owner.toString() !== owner) {
      throw HttpError(404, "Not found");
    }

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const owner = req.user.id;
    const { id } = req.params;

    const contact = await Contact.findOneAndDelete({ _id: id, owner });
    if (!contact) {
      throw HttpError(404, "Not found");
    }

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const owner = req.user.id;
    const { name, email, phone } = req.body;
    const contact = {
      name,
      email,
      phone,
      owner,
    };
    const newContact = await Contact.create(contact);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const owner = req.user.id;
    const { name, email, phone } = req.body;
    const { id } = req.params;

    if (!name && !email && !phone) {
      throw HttpError(400, "Body must have at least one field");
    }

    const updatedContact = await Contact.findOneAndUpdate(
      { _id: id, owner },
      req.body,
      {
        new: true,
      }
    );
    if (updatedContact === null) {
      throw HttpError(404, "Not found");
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};

export const updateStatusContact = async (req, res, next) => {
  try {
    const owner = req.user.id;
    const { id } = req.params;

    const updatedContact = await Contact.findOneAndUpdate(
      { _id: id, owner },
      req.body,
      {
        new: true,
      }
    );
    if (updatedContact === null) {
      throw HttpError(404, "Not found");
    }

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};
