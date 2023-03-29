require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const cors = require('cors')
const jwt = require("jsonwebtoken")
const WriteToMSSQL = require("./WriteToMSSQL")
const ReadFromMSSQL = require("./ReadFromMSSQL")
const port = 5000
const app = express()


app.use(bodyParser.json({ type: "*/*" }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

const users = [
    {
        username: "test",
        password: "test",
        id: 1
    },
    {
        username: "test1",
        password: "test1",
        id: 2
    }
]

let refTokens = []

app.post("/login", (req, res) => {

    const { Username, Password } = req.body

    const user = users.find(x => {
        return x.username === Username && x.password === Password
    })

    if (user) {
        const accessToken = jwt.sign({ Username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10s" })
        const refreshToken = jwt.sign({ Username }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "30s" })
        refTokens.push(refreshToken)
        res.json({ Username: Username, accessToken: accessToken, refreshToken: refreshToken })
    }

    else {
        res.json({ errorMessage: "Incorrect username or password" })
    }
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (token === null)
        return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403)
        req.user = user
        next()
    })
}

app.post("/refresh", (req, res) => {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]
    if (token === null)
        return res.sendStatus(401)
    if (!refTokens.includes(token)) {

        return res.sendStatus(403)
    }
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err)
            return res.sendStatus(403)
        const accessToken = jwt.sign({ Username: user.name }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "10s" })
        const refreshToken = jwt.sign({ Username: user.name }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "30s" })
        console.log(accessToken)
        refTokens.push(refreshToken)
        res.json({ Username: user, accessToken: accessToken, refreshToken: refreshToken })

    })

})
app.post(("/Auth"), authenticateToken, (req, res) => {

})

app.delete("/logout", (req, res) => {
    console.log("delete")
    refTokens = []
    res.sendStatus(204)
})

app.get(("/sql"), (req, res) => {
    WriteToMSSQL("Neko ime")
    res.send("uneseno")
})

app.post(("/Home"), (req, res) => {
    res.send("Access allowed")
})
app.post(("/HomePage"), async(req, res) => {
    res.send(await ReadFromMSSQL(req.body.username + "%"))

    /*
    console.log(req.body.username)
    WriteToMSSQL(req.body.username)*/
})

app.get(("/HomeGetData"), async (req, res) => {
    res.send(await ReadFromMSSQL("user%"))
    
   

})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})