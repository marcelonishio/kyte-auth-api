import { MongoClient, Db } from 'mongodb'


const createMongoConn = async (
    { database, uri }:{ database:string, uri: string }
): Promise<Db> => {
    
    let conn = await MongoClient.connect(uri)
    if (!conn) throw new Error('Não foi possível fazer a conexão com o MongoDB')
    let connWithDb = conn.db(database)
    console.log(`\x1b[46m MongoDB: Aberta a conexão com o mongoDB para o banco de dados ${database} \x1b[0m`)
    return connWithDb

}

export {
    Db,
    createMongoConn
}
