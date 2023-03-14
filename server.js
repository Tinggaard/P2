const express = require('express')
const app = express()
const port = 3000
let active_users = 0;

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/front_page.html');
});

app.get('/connect', (req, res) => {
    active_users++;
    res.send(`{"newID": 1}`);
})

app.get('/disconnect', (req, res) => {
    active_users--;
    res.send(`{"newID": 1}`);
})

app.get('/active-users', (req, res) => {
    res.send(`{"userCount": ${active_users}}`);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
