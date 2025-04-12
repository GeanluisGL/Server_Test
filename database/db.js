import mongoose from "mongoose";

const connectToDB = async () => {
    await mongoose.connect(process.env.URI).then((res) => {
        console.log("Connected to MongoDB");    
    })  }

    export default connectToDB;