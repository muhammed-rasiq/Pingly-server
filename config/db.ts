import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const db = async () => {
    try {
        await mongoose.connect(process.env.dbConnect!);
        console.log('Database Connected');
    } catch (error) {
        console.log('Error in Database connecting:', error);
        process.exit(1);
    }
};


export default db;