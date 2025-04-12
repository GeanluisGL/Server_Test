import mongoose,  { model, Schema } from "mongoose";

const AdhairSchema = new Schema({
        ProductName: {type: String, require: true},
        ProductDescrip: {type: String, require: false},
        ProductPrice: {type: String, require: true},
        images: { type: [String], default: [] },
        status: {type:Boolean, require: true}

});

export const CRUDadhair = mongoose.models.CRUDadhair || new model("CRUDadhair", AdhairSchema);