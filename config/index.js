import dotenv from 'dotenv';
dotenv.config();

// object destructuring
export const {
    APP_PORT,
    DEBUG_MODE,
    MONGO_URL,
    JWT_SECRET,
    REFRESH_SECRET,
    APP_URL
} = process.env; // here you get all the keys from dot env file