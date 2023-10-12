const express = require("express")
const mongoose = require("mongoose")
const app = express()
const cors = require("cors")
const NotesModel = require('./model/NotesModel')

app.use(cors())
app.use(express.json())
const PORT = process.env.PORT || 3001

mongoose.connect("mongodb+srv://ssukhvant:11707506@notescluster.dbdp3fu.mongodb.net/?retryWrites=true&w=majority")
.then(() => {
    console.log("Connected to Database")
});

//Insert data

app.post('/insert', async (req, res) => {
    const {title, note, color} = req.body
    if(!title || !note || !color){
        return res.status(422).json({success: true, status: "Please fill the all fields."})
    }

    let createdAt = new Date()
    const createdNote = new NotesModel({title: title, note: note, color: color, createdAt: createdAt})
    try {
        await createdNote.save()
        res.json({success: true, status: "Data inserted", data: createdNote})
    } catch(err) {
        console.log(err)
    }
});

//Read data

app.get("/read", async(req, res) => {
    const data = await NotesModel.find({})
    res.json({success: true, data: data})
});

//Update data

app.put('/update', async(req, res) => {
    const {id, ...updatedData} = req.body
    const data = await NotesModel.updateOne({_id: req.body.id}, updatedData)
    res.json({success: true, status: "Data updated successfully", data: data})
});

//Delete data

app.delete('/delete/:id', async(req, res) => {
    const id = req.params.id
    console.log(id)
    const data = await NotesModel.deleteOne({_id : id})
    res.json({success: true, status: "Data deleted successfully", data: data})
})

app.listen(PORT, () => console.log(`Server is running at ${PORT}`));
