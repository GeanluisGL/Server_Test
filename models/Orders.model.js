import mongoose,  { model, Schema } from "mongoose";

const OrderSchema = new Schema({
        Quantity: {type: String, require: true},
        ClientID: {type: String, require: true},
        ClientName: {type: String, require: true},
        ClientAddress: {type: String, require: true},
        ClientNumber: {type: String, require:true},
        WigId: {type: String, require: true},
        WigColor: {type: String, require: true},
        WigLongitude: {type: String, require: true},
        HeadSize: {type: String, require: true},
        Description: {type: String, require: true},
        TransferId: {type: String, require: true},
        FinalPrice : {type: String, require: true},
        images: { type: [String], default: [] },
        createdAt : {type: Date, default: Date.now}      
        
},  {
        timestamps: { createdAt: true, updatedAt: false }
      }

);

export const Order = mongoose.models.Order || new model("Order", OrderSchema);