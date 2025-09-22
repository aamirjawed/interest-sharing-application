import express from 'express'
import dotenv from 'dotenv'
import connectDB from './db/index.js'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoutes.js'
import interestRoutes from './routes/interestRoutes.js'

dotenv.config()

const port = process.env.PORT || 3000

const app  = express()


app.use(express.json())

app.use(express.urlencoded({extended:false}))

app.use(cookieParser())


// auth api
app.post('/test', (req, res) => {
    console.log("Test route hit", req.body);
    res.json({ message: "Test route works!" });
});


app.use('/v1/auth', authRoutes)
app.use('/v1/interest', interestRoutes)


connectDB().then((result) => {
    app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})
}).catch((err) => {
    console.log("Error in app.js while connecting the db", err)
});
