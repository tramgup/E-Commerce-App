import express from 'express'
import prisma from '../prismaClient.js'

const router = express.Router()

// get admin view of all products
router.get('/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { id: 'desc' }
        })
        
        res.json(products)
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ message: "Error fetching products" })
    }
})

// create a new product
router.post('/products', async (req, res) => {
    try {
        const { name, price } = req.body
        
        // Validate required fields
        if (!name || !price) {
            return res.status(400).json({ 
                message: "Name and price are required" 
            })
        }
        
        // Validate price is a positive number
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ 
                message: "Price must be a valid positive number" 
            })
        }
        
        // Create the product
        const product = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price)
            }
        })
        
        res.status(201).json({
            message: "Product created successfully",
            product
        })
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ message: "Error creating product" })
    }
})

// update an existing product
router.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { name, price } = req.body
        
        // Check if product exists
        const existingProduct = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        })
        
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" })
        }
        
        // Validate price if it's being updated
        if (price !== undefined && (isNaN(price) || price < 0)) {
            return res.status(400).json({ 
                message: "Price must be a valid positive number" 
            })
        }
        
        // Build update object with only provided fields
        const updateData = {}
        if (name !== undefined) updateData.name = name
        if (price !== undefined) updateData.price = parseFloat(price)
        
        // Update the product
        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: updateData
        })
        
        res.json({
            message: "Product updated successfully",
            product
        })
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ message: "Error updating product" })
    }
})

// Delete a product
router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params
        
        // check if product exists
        const existingProduct = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        })
        
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" })
        }
        
        // Delete the product
        // Note: This will fail if there are cart items referencing this product
        // because of the foreign key relationship
        await prisma.product.delete({
            where: { id: parseInt(id) }
        })
        
        res.json({ message: "Product deleted successfully" })
    } catch (err) {
        console.error(err.message)
        // Check if it's a foreign key constraint error
        if (err.code === 'P2003') {
            return res.status(400).json({ 
                message: "Cannot delete product. It exists in shopping carts." 
            })
        }
        res.status(500).json({ message: "Error deleting product" })
    }
})

export default router