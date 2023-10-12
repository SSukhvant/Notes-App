const express = require("express")
const mongoose = require("mongoose")
const app = express()
const cors = require("cors")

app.use(cors())
app.use(express())
const PORT = process.env.PORT || 3001

mongoose.connect("mongodb+srv://ssukhvant:11707506@notescluster.dbdp3fu.mongodb.net/?retryWrites=true&w=majority")
.then(() => {
    console.log("Connected to Database")
})

// app.get("/read", (req, res) => {
//     res.json({success: true, message: "Reading..."})
// })

app.listen(PORT, () => console.log("Server is running at 3001"));
