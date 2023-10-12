const mongoose = require("mongoose")

const NotesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    note: {
        type: String,
        required: true
    },

    color: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    }
});

const NotesModel = mongoose.model("Notes", NotesSchema);
module.exports = NotesModel;