import mongoose from "npm:mongoose@7.6.3";
import { Pet } from "../main.ts";
import { gqlSchema } from "../main.ts";
const Schema = mongoose.Schema;

const mascotaSchema = new Schema(
  {
    name: { type: String, required: true },
    breed: { type: String,required: true }
  },
  { timestamps: true }
);

export type tipomascota = mongoose.Document&Omit<Pet,"id"> ;// definir el ripo del modelo

export const ModeloMascota= mongoose.model<tipomascota>("Mascotas",mascotaSchema);


