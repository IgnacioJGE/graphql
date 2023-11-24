import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { GraphQLError } from "graphql";
import { ModeloMascota } from "./db/mascotas.ts";
import { load } from "https://deno.land/std@0.204.0/dotenv/mod.ts";
import mongoose from "npm:mongoose@7.6.5";

export type  Pet={
id: string;
name: string;
breed: string;
}
export const gqlSchema=`#graphql
type Pet{
    id:ID!
    name:String!
    breed: String!
}

type Query{
pets:[Pet!]!
pet(id:ID!): Pet!
petbreed(breed:String!):[Pet!]!
}
type Mutation{
addPet(name: String!,breed:String!):Pet!
deletePet(id:ID!):Pet!
updatePet(id:ID!,name: String!,breed:String!):Pet!
}
`;
const Query={
    pets: async ():Promise<Pet[]>=>{
        const mascs= await ModeloMascota.find().exec();
        const pets:Pet[] = mascs.map((pet)=>({
            id: pet._id.toString(),
            name: pet.name,
            breed: pet.breed

        }))
        return pets;
    },
    pet:async (_:unknown,args:{id:string}): Promise<Pet> =>{
        const {id}= args;
       const mascota=  await ModeloMascota.findById(id)

       if(!mascota){
        throw new GraphQLError(`No existe esta mascota ${args.id}`, {
            extensions: { code: "NOT_FOUND" },
          })
       }
       const masc:Pet={
        id: mascota._id.toString(),
        name: mascota.name,
        breed: mascota.breed
       }
       return masc;
    },
    petbreed: async(_:unknown,args:{breed:string}):Promise<Pet[]> =>{
        const {breed}= args;

        const mascs= await ModeloMascota.find({breed}).exec();
        const pets:Pet[] = mascs.map((pet)=>({
            id: pet._id.toString(),
            name: pet.name,
            breed: pet.breed

        }))
        return pets;

    },

}
const Mutation={
    addPet: async (
        _:unknown,args:{name:string;breed:string},
    ):Promise<Pet> =>{
        const {name,breed}=args;
        const mascota= new ModeloMascota({name,breed})
        await mascota.save();
        const masc:Pet={
            id: mascota._id.toString(),
            name: mascota.name,
            breed: mascota.breed
           }
        return masc;
    },
    deletePet:async (
        _:unknown,args:{id:string},
    ):Promise<Pet> =>{
        const {id}=args;
        const mascota= await ModeloMascota.findById(id);

        if(!mascota){
            throw new GraphQLError(`No existe esta mascota${args.id}`, {
                extensions: { code: "EXISTS" },
              })

        }else{
            const masc:Pet={
                id: mascota._id.toString(),
                name: mascota.name,
                breed: mascota.breed
               }
            await ModeloMascota.findByIdAndDelete(id);
            return masc;
        }

    },
    updatePet: async (
        _:unknown,args:{id:string;name:string;breed:string},
    ):Promise<Pet> =>{
        const {id,name,breed}=args;
        const mascota= await ModeloMascota.findById(id);

        if(!mascota){
            throw new GraphQLError(`No existe esta mascota${args.id}`, {
                extensions: { code: "EXISTS" },
              })


        }else{
            const masc:Pet={
                id: mascota._id.toString(),
                name:  name,
                breed: breed
               }
            await ModeloMascota.findByIdAndUpdate(id,{name,breed},{new:true}).exec();
            return masc;
        }

    },
 };

const env = await load();
const MONGO_URL=env.MONGO_URL||Deno.env.get("MONGO_URL")// si hay .emv lo leo si no lo lee de las variables de entorno de deno
if (!MONGO_URL) {
  console.log("No mongo URL found");
  Deno.exit(1);
}

    await mongoose.connect(MONGO_URL);
    console.info("Mongo Concectado")
    const server = new ApolloServer({
        typeDefs: gqlSchema,
        resolvers:{
            Query,
            Mutation,
        },
    });
    const url= await startStandaloneServer(server, {
        listen:{
            port:3000,
        },
    });



    
