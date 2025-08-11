import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'

const router = express.Router();

router.post('/register', (req, res) => {
    const { username, password } = req.body

    const hashedPassword = bcrypt.hashSync(password, 8)

    try {

        const insertUser = db.prepare(`
            INSERT INTO users (username, password) VALUES (?, ?)
        `)

        const result = insertUser.run(username, hashedPassword)

        const defaultTodo = 'Hello, here you can add your first todo!'
        const insertTodo = db.prepare(`
            INSERT INTO todos (user_id, task) VALUES (?, ?)
        `)

        const lastUserId = result.lastInsertRowid

        insertTodo.run(lastUserId, defaultTodo)

        const token = jwt.sign({ id: lastUserId }, process.env.JWT_SECRET, { expiresIn: '24h' })

        res.json({ token })

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }

})

router.post('/login', (req, res) => {
    const { username, password } = req.body

    try {
        // Search for user in the database
        const findUser = db.prepare(`
        SELECT * FROM users WHERE username = ?
        `)

        const user = findUser.get(username)

        if (!user) {
            return res.status(400).send({ message: 'User not found!' })
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password)

        if (!isPasswordValid) {
            return res.status(401).send({ message: 'Please enter a valid passwod!' })
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json({ token })

    } catch (error) {
        console.log(error);
        res.sendStatus(500)
    }

})

export default router