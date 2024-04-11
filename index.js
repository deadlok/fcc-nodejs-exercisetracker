const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
console.log(process.env.MONGO_URI)
let bodyParser = require('body-parser')
///////////////////////////////
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  }
})

const exerciseSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
})

const logItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
})

const logSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  count: Number,
  log: [logItemSchema]
  
})

let User = mongoose.model('User', userSchema)
let Exercise = mongoose.model('Exercise', exerciseSchema)
let Log = mongoose.model('Log', logSchema)

///////////////////////////////

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

app.post('/api/users', async function(req, res) {
  let user = new User({username: req.body.username})
  try {
    const doc = await user.save()
    res.json({
      username: doc.username,
      _id: doc._id
    })
  } catch (err) {
    console.log(err)
  }
})

app.get('/api/users', async function(req, res) {
  try {
    const data = await User.find({}).select('username _id')
    res.json(data)
  } catch (err) {
    console.log(err)
  }
})

app.post('/api/users/:_id/exercises', async (req, res)=>{
  //console.log('exercise post')
  const userid = req.params._id
  try {
    const user = await User.findById(userid)
    const p_description = req.body.description
    const p_duration = req.body.duration
    const p_date = req.body.date
    let description, duration, date = Date.now()


    if (p_description && p_duration){

      // validate date
      if (p_date) {
        date = Date.parse(p_date)
        if (date == NaN){
          console.log("Not a valid date format")
         return -1
        }
      }

      // validate duration
      if (p_duration <= 0){
        console.log("Exercise duration must greater than zero") 
        return -1
      } else duration = p_duration

      //validate description
      description = p_description

    } else {
      console.log("Not enough information")
      return -1
    }
    const exercise = new Exercise({
      username: user.username,
      description: description,
      duration, duration,
      date, date
    })

    doc = await exercise.save()

    return res.json({
      _id:user._id,
      username:user.username,
      date: doc.date.toDateString(),
      duration: doc.duration,
      description:doc.description
    })
  } catch (err) {
    console.log(err)
    return -1
  }
})

app.get('/api/users/:_id/logs', async (req, res) => {
  const userid = req.params._id
  try {
    const user = await User.findById(userid)
    let data = await Exercise.find({username: user.username}).select('description duration date')
    let count = data.length
    let exercises = []
    data.map((item)=>{
      exercises.push({
        descripton: item.description,
        duration: item.duration,
        date: item.date.toDateString()
      })
    })

    //console.log(exercises)

    res.json({
      _id: user._id,
      username: user.username,
      count: count,
      log: exercises
    })
  } catch (err) {
    console.log(err)
    return -1
  }
})
