import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { nanoid } from 'nanoid';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


let User = {};
let Excercise = {};

app.post('/api/users', (req, res) => {
  const username = req.body.username;

  if (User[username]) {
    res.json({
      "error": "Username already taken"
    });
  }

  const user = {
    username: username,
    _id: nanoid(24)
  };

  User[user._id] = user;
  Excercise[user._id] = [];
  res.json(User[user._id]);

  // console.log(User);
  // console.log(Excercise);

});

app.get('/api/users', (req, res) => {
  res.json(Object.values(User));
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  let date = '';

  if (!req.body.date) {
    date = new Date().toDateString();
  } else {
    date = new Date(req.body.date).toDateString();
  }

  if (!User[userId]) {
    res.json({
      "error": "User not found"
    });
  }

  const exercise = {
    username: User[userId].username,
    description: description,
    duration: duration,
    date: date,
    _id: userId
  };

  Excercise[userId].push(exercise);
  res.json(exercise);

  // console.log(User);
  // console.log(Excercise);

});

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  if (!User[userId]) {
    res.json({
      "error": "User not found"
    });
  }

  const logs = [];
  const exercises = Excercise[userId] || [];

  for (let i = 0; i < exercises.length; i++) {
    const exerciseDate = new Date(exercises[i].date);

    if (
      (!from || exerciseDate >= from) &&
      (!to || exerciseDate <= to)
    ) {
      logs.push({
        description: exercises[i].description,
        duration: exercises[i].duration,
        date: exerciseDate.toDateString() 
      });
    }
  }
  
  if (limit) {
    logs.splice(limit);
  }

  res.json({
    "username": User[userId].username,
    "count": logs.length,
    "log": logs
  });

  // console.log(User);
  // console.log(Excercise);

})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
