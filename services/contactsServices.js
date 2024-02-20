// const fs = require("node:fs").promises;
// const path = require("node:path");
// const crypto = require("node:crypto");

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contactsPath = path.join(__dirname, "../db/contacts.json");

async function readContacts() {
  const data = await fs.readFile(contactsPath, { encoding: "utf-8" });
  return JSON.parse(data);
}

async function writeContacts(contacts) {
  return await fs.writeFile(
    contactsPath,
    JSON.stringify(contacts, undefined, 2)
  );
}

async function listContacts() {
  const allcontacts = await readContacts();
  return allcontacts;
}

async function getContactById(contactId) {
  const allcontacts = await readContacts();
  const contact = allcontacts.find((contact) => contact.id === contactId);

  return allcontacts.find((contact) => contact.id === contactId) || null;
}

async function removeContact(contactId) {
  const allcontacts = await readContacts();
  const index = allcontacts.findIndex((contact) => contact.id === contactId);

  if (index === -1) {
    return null;
  }

  const deletedContact = allcontacts.splice(index, 1);
  await writeContacts(allcontacts);

  return deletedContact;
}

async function addContact({ name, email, phone }) {
  const allcontacts = await readContacts();

  const newContact = {
    id: crypto.randomUUID(),
    name,
    email,
    phone,
  };

  allcontacts.push(newContact);
  await writeContacts(allcontacts);

  return newContact;
}

async function updateContact(contactId, data) {
  const allcontacts = await readContacts();
  const index = allcontacts.findIndex((contact) => contact.id === contactId);

  if (index === -1) {
    return null;
  }

  const { name, email, phone } = data;

  allcontacts[index].name = name ? name : allcontacts[index].name;
  allcontacts[index].email = email ? email : allcontacts[index].email;
  allcontacts[index].phone = phone ? phone : allcontacts[index].phone;

  await writeContacts(allcontacts);
  return allcontacts[index];
}

const contactsService = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};

export default contactsService;
