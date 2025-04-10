// src/controller/helloController.js
export const sayHello = (req, res) => {
    res.status(200).send('hello');
};