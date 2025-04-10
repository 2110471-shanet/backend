import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from '../model/user.js';
import validator from 'validator';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET

const validatePassword = (password) =>{
    return validator.isAscii(password) && validator.isStrongPassword(password)
}

const register = async(req, res) => {
    const { username, password } = req.body
    
    if(!username || !password){
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try{
        const existingUser = await User.findOne({username})

        if (existingUser){
            return res.status(400).json({ message: 'This username already exists.'})
        }

        if (!validatePassword(password)){
            return res.status(400).json({ message: 'Required stronger password'})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username : username,
            password : hashedPassword,
        })

        const createdUser = await newUser.save()
        const userWithoutPassword = createdUser.toObject();
        delete userWithoutPassword.password; // Remove password from the response

        res.status(201).json({ message: 'User registered successfully!', user: userWithoutPassword });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const login = async(req, res) => {
    const { username, password } = req.body;

    try {
        // Here you should check the user's credentials, e.g., find the user in the database
        const user = await User.findOne({ username })
        
        if (!user) {
            return res.status(401).json({ message: 'User not exists' });
        }

        // Add password verification logic (e.g., using bcrypt)
        // Assuming passwords are hashed
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

        // Set the cookie
        res.cookie('token', token, {
            httpOnly: true, // Helps prevent XSS attacks
            secure: true, // Set to true if using HTTPS
            maxAge: 3600000*24, // 24 hour
            sameSite: 'None',   
        });

        res.status(200).json({ message: 'Login successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const logout = async(req, res) => {
    // Clear the token cookie
    try{
        res.clearCookie('token', {
            httpOnly: true, // Helps prevent XSS attacks
            secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
            sameSite: 'Strict', // Helps prevent CSRF attacks
        });
        
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export { register, login, logout }