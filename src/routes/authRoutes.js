import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prisma/Client.js'
import db from '../db.js'

const router = express.Router()

//function that creates a JWT sign in access Token
function signAccessToken(user){
    return jwt.sign(
        { sub: user.id, email: user.email},
        process.env.JWT_SECRET,
        { expiresIn: "24h"}
    );
}

// Register a new user endpoing /auth/register
router.post('/register', async (req, res) => {
    const { email, password } = req.body
    // save the username and encrypted password

    // encrypt the password
    const hashedPassword = bcrypt.hashSync(password, 8)

    // save the new user and hashed password to the db
    try {
        const user = await prisma.user.create({
            data: {
                email,
                hashedPassword,
                cart: { create: {} },
            }
    });

        // create a token
        const token = signAccessToken(user);
        return res.status(201).json({ token });

    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
});

router.post('/login', async (req, res) => {

    const { email, password } = req.body

    try {
        const user = await prisma.user.findUnique({
            where: {email}
        });
        
        //user not found
        if (!user) return res.status(404).json({message: "User not found"});

        //compare passwords and if invalid return that
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(401).json({message: "Invalid password"});

        const token = signAccessToken(user);

        return res.status(200).json({token, user : {id: user.id, email: user.email}});

    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }

})


export default router