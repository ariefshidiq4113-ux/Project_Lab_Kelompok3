import mongoose from "mongoose";
import envVariables from "../utils/ENV.js";

const MONGODB_URI = envVariables.MONGODB_URI
const connectDb = async () => {
    try {
        await mongoose.connect(MONGODB_URI, { dbName: "presensi_pintar" });
        console.log("db connect");
    } catch (error) {
        console.log(error);
        return process.exit(1)
    }
}

export default connectDb