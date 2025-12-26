import prisma from '../prismaClient.js'

// Middleware to check if user is an admin
// This runs AFTER authMiddleware, so we already have req.userId
async function adminMiddleware(req, res, next) {
    try {
        // Look up the user in the database
        const user = await prisma.user.findUnique({
            where: { id: req.userId }
        })
        
        // If user doesn't exist or isn't an admin, deny access
        if (!user || !user.isAdmin) {
            return res.status(403).json({ 
                message: "Access denied. Admin privileges required." 
            })
        }
        
        // User is an admin, allow them to proceed
        next()
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ message: "Error verifying admin status" })
    }
}

export default adminMiddleware