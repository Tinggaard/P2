const express = require('express')
const app = express()
const port = 3000
let active_users = 0;
let unique_users = 0;
const operators = ['+', '-', '*', '/'];

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/front_page.html');
});

app.get('/connect', (req, res) => {
    active_users++;
    console.log(createID());
    res.send(`{"newID": ${createID()}}`);
})

function createID(){
    unique_users++;
    return 1;
}

app.get('/disconnect', (req, res) => {
    active_users--;
    res.send(`{"newID": 1}`);
})

app.get('/active-users', (req, res) => {
    let information = {userCount: active_users,
                       task: createTask()};
    res.send(information);
})

app.get('/get-task', (req, res) => {
    res.send(`{"userCount": ${active_users},
                "task": ${createTask()}}`);
})


function createTask(){
    const numbers = {
        num1: Math.floor(Math.random() * 10) + 1,
        num2: Math.floor(Math.random() * 10) + 1,
        operator: operators[Math.floor(Math.random() * operators.length)]
      };
    return numbers;
}


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
