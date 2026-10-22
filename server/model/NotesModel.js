const mongoose = require("mongoose");

const NotesSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  note: { type: String, required: true, trim: true, maxlength: 20000 },
  color: { type: String, required: true, match: /^#[0-9a-fA-F]{6}$/ },
}, { timestamps: true, versionKey: false });

NotesSchema.index({ owner: 1, updatedAt: -1 });
NotesSchema.index({ owner: 1, title: 1 });

module.exports = mongoose.models.Notes || mongoose.model("Notes", NotesSchema);
