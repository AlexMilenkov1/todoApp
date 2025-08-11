import express from 'express'
import db from '../db.js'

const router = express.Router();

// Get all the todos
router.get('/', (req, res) => {
    const getTodos = db.prepare(`
        SELECT * FROM todos WHERE user_id = ?
    `)
    const todos = getTodos.all(req.userId)
    res.json(todos)
})

// Create new todo
router.post('/', (req, res) => {
    const {task} = req.body

    const insertTodo = db.prepare(`
        INSERT INTO todos (user_id, task) VALUES (?, ?)
    `)

    const todo = insertTodo.run(req.userId, task)

    res.json({id: todo.lastInsertRowid, task, complete: 0})
})

// Update a todo 
router.put('/:id', (req, res) => {
    const {completed} = req.body
    const {id} = req.params

    const updateTodo = db.prepare('UPDATE todos SET completed = ? WHERE id = ?')
    updateTodo.run(completed, id)
    
    res.json({message: "Todo is completed!"})
})

// Delete a todo 
router.delete('/:id', (req, res) => { 
    const userId = req.userId
    const {id} = req.params

    const deleteTodo = db.prepare('DELETE FROM todos WHERE id = ? AND user_id = ?')
    deleteTodo.run(id, userId)
    
    res.json({message: "Todo is deleted!"})

})

export default router