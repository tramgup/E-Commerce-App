import express from 'express'
import db from '../db.js'
import prisma from '../prismaClient.js'

const router = express.Router()

// Get all products with an optional search
router.get('/products', async (req, res) => {
    try {
        const {search} = req.query
        
        //optional search filter
        const products = await prisma.product.findMany({
            where: search ? {
                name: {
                    contains: search,
                    mode: 'insensitive' //case-insensitive search
                }
            } : {}
        });
        
        res.json(products); //return json of products
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({message: "error fetching products"});

    }

})


//get all items from users cart

//add item to the current users shopping cart
router.post('/additem', (req, res) => {

})

//put item in current users shopping cart (update)

//delete cart item

//delete entire cart

//post checkout endpoint

// Create a new todo
router.post('/', (req, res) => {
    const { task } = req.body
    const insertTodo = db.prepare(`INSERT INTO todos (user_id, task) VALUES (?, ?)`)
    const result = insertTodo.run(req.userId, task)

    res.json({ id: result.lastInsertRowid, task, completed: 0 })
})

// Update a todo
router.put('/:id', (req, res) => {
    const { completed } = req.body
    const { id } = req.params
    const { page } = req.query

    const updatedTodo = db.prepare('UPDATE todos SET completed = ? WHERE id = ?')
    updatedTodo.run(completed, id)

    res.json({ message: "Todo completed" })
})

// Delete a todo
router.delete('/:id', (req, res) => {
    const { id } = req.params
    const userId = req.userId
    const deleteTodo = db.prepare(`DELETE FROM todos WHERE id = ? AND user_id = ?`)
    deleteTodo.run(id, userId)
    
    res.send({ message: "Todo deleted" })
})

export default router