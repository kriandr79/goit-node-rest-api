import Contact from "../models/contacts.js";
import HttpError from "../helpers/HttpError.js";

export const getAllContacts = async (req, res) => {
  try {
    const allcontacts = await Contact.find();
    res.json(allcontacts);
    console.log("allcontacts:", allcontacts);
  } catch (error) {
    next(error);
  }
};

export const getOneContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);

    if (!contact) {
      throw HttpError(404, "Not found");
    }

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByIdAndDelete(id);
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
    const newContact = await Contact.create(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    if (!name && !email && !phone) {
      throw HttpError(400, "Body must have at least one field");
    }

    const { id } = req.params;

    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
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
       const { id } = req.params;

       const updatedContact = await Contact.findByIdAndUpdate(id, req.body, {
         new: true,
       });
       if (updatedContact === null) {
         throw HttpError(404, "Not found");
       }

       res.status(200).json(updatedContact);
     } catch (error) {
       next(error);
     }

  };