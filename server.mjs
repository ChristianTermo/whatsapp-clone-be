import express from "express";
import mongoose from "mongoose";
import dbMessages from "./models/dbMessages.mjs";
import mysql from "mysql";
import bodyParser from "body-parser";
import Pusher from 'pusher';
import cors from 'cors';

const app = express();
const port = 9001;
app.use(bodyParser.json());
app.use(cors());
//mysql db
/*
var con = mysql.createConnection({
  host: "localhost",
  port:3306,
  user: "root",
  password: "Forzamilan2015",
  database:"photos"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
*/
const pusher = new Pusher({
    appId: "1660399",
    key: "a2e1d7e0112669256b0c",
    secret: "0c0e11a53bbf54fd1183",
    cluster: "eu",
    useTLS: true
  });
//mongodb
const connection = "mongodb+srv://admin:QF9hHCbdnxT8fc8m@cluster0.6e9gkcs.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(connection, {});
const db = mongoose.connection;

db.once('open', function() {
    console.log('db connesso')
    const msgCollection=db.collection('messagecontents')
    const changeStream=msgCollection.watch();

    changeStream.on("change", (change)=>{
        if (change.operationType === 'insert') {
            const record=change.fullDocument;
            pusher.trigger("messages", "insert", {
                'name':record.name,
                'message': record.message
              });
        } else {
            console.log('no insert')
        }

    })
})
app.post('/messages', (req, res) => {
    const messages = req.body;
    dbMessages.create(messages).then((data, err) => {
        res.status(201).send(data)
    }).catch((err) => {
        res.status(500).send(err);
    })
});

app.get('/messages/sync', (req, res) => {
    dbMessages.find().then((data, err) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data)
        }
    })
})

app.listen(port, () => {
    console.log("server started on port:", { port })
})