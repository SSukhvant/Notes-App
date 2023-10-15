require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const NotesModel = require("./model/NotesModel");

app.use(cors(
  {
    origin: ["https://s-notes-app.netlify.app"],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true
  }
));
app.use(express.json());
const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to Database");
  });

//Insert data

app.post("/insert", async (req, res) => {
  const { title, note, color } = req.body;
  if (!title || !note || !color) {
    return res
      .status(422)
      .json({ success: false, status: "Please fill the all fields." });
  }

  let createdAt = new Date();
  const createdNote = new NotesModel({
    title: title,
    note: note,
    color: color,
    createdAt: createdAt,
  });
  try {
    await createdNote.save();
    res.json({ success: true, status: "Data inserted", data: createdNote });
  } catch (err) {
    console.log(err);
  }
});

//Read data

app.get("/read", async (req, res) => {
  const data = await NotesModel.find({});
  res.json({ success: true, data: data });
});

app.get("/search", async (req, res) => {
  const searchQuery = req.query.q;

  try {
    const data = await NotesModel.find({
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        { note: { $regex: searchQuery, $options: "i" } },
      ],
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, status: "Error searching notes" });
  }
});

// Update data

app.put("/update/:id", async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  try {
    const data = await NotesModel.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    if (data) {
      res.json({ success: true, status: "Data updated successfully", data });
    } else {
      res.status(404).json({ success: false, status: "Note not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, status: "Error updating data" });
  }
});

//Delete data

app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;
  const data = await NotesModel.deleteOne({ _id: id });
  res.json({ success: true, status: "Data deleted successfully", data: data });
});

app.listen(PORT, () => console.log(`Server is running at ${PORT}`));
