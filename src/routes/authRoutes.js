import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prismaClient.js'

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password } = req.body

    const hashedPassword = bcrypt.hashSync(password, 8)

    try {
        const user = await prisma.user.create({
            data : {
                username,
                password: hashedPassword
            }
        })

        const defaultTodo = 'Hello, here you can add your first todo!'
        await prisma.todo.create({
            data: {
                task: defaultTodo,
                userId: user.id
            }
         })


        const token = jwt.sign({ id: user.id}, process.env.JWT_SECRET, { expiresIn: '24h' })

        res.json({ token })

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }

})

router.post('/login', async(req, res) => {
    const { username, password } = req.body

    try {
        // Search for user in the database
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        })

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