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

});


//get all items from users cart
router.get('/cart', async (req, res) => {
    try {

        //attempt to find users cart and include all item and product details
        const cart = await prisma.cart.findUnique({
            where: {userId: req.userId},
            include: {
                items: {
                    include: {
                        product: true   //include full product details
                    }
                }
            }
        })

        const total = cart.items.reduce((sum, item) => {
            return sum + (Number(item.product.price) * item.quantity)
        }, 0)
        
        res.json({ 
            cart,
            total: total.toFixed(2),
            itemCount: cart.items.length
        })
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ message: "Error fetching cart" })
    }
})

// Add item to cart (or update quantity if already exists)
router.post('/cart/add', async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body
        
        // Validate inputs
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" })
        }
        
        if (quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" })
        }
        
        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: parseInt(productId) }
        })
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        
        // Get user's cart
        const cart = await prisma.cart.findUnique({
            where: { userId: req.userId }
        })
        
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" })
        }
        
        // Check if item already exists in cart
        const existingItem = await prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId: parseInt(productId)
                }
            }
        })
        
        let cartItem
        
        if (existingItem) {
            // Update quantity (add to existing)
            cartItem = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + parseInt(quantity) },
                include: { product: true }
            })
        } else {
            // Create new cart item
            cartItem = await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: parseInt(productId),
                    quantity: parseInt(quantity)
                },
                include: { product: true }
            })
        }
        
        res.status(201).json({ 
            message: "Item added to cart",
            cartItem 
        })
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ message: "Error adding item to cart" })
    }
})

//put item in current users shopping cart (update)

// Remove item from cart
router.delete('/cart/item/:id', async (req, res) => {
    try {
        const { id } = req.params
        
        // Verify item belongs to user's cart
        const cartItem = await prisma.cartItem.findUnique({
            where: { id: parseInt(id) },
            include: { cart: true }
        })
        
        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" })
        }
        
        if (cartItem.cart.userId !== req.userId) {
            return res.status(403).json({ message: "Unauthorized" })
        }
        
        // Delete item
        await prisma.cartItem.delete({
            where: { id: parseInt(id) }
        })
        
        res.json({ message: "Item removed from cart" })
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ message: "Error removing item from cart" })
    }
})

// Clear entire cart
router.delete('/cart', async (req, res) => {
    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: req.userId }
        })
        
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" })
        }
        
        // Delete all items in cart
        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id }
        })
        
        res.json({ message: "Cart cleared" })
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ message: "Error clearing cart" })
    }
})

//post checkout endpoint


export default router