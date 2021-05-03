
const process = require("process");
const axios=require("axios");

const API_KEY = process.env.API_KEY;
const API_URL = process.env.API_URL

exports.handler = async (event) => {
    let features={
        "entities": {
          "emotion": true,
          "sentiment": true,
          "limit": 5
        },
        "keywords": {
          "emotion": true,
          "sentiment": true,
          "limit": 5
        }
    }
    let nlu_req_data = {"text":event.historial_clinico,features};
    let nlu_response=null;
    let auth={username:"apikey",password:API_KEY}
    try{
        nlu_response = await axios.post(API_URL+"/v1/analyze?version=2021-03-25",nlu_req_data,{auth})
    }
    catch(e){
        return {"error":"Fallo peticion con el error:"+e.response.data.error}
    }
    let data=nlu_response.data;
    let keywords = data.keywords.map(item => item.text)
    let entities = data.entities.map(item => item.text)
    let keyword_data = {}
    let entity_data = {}
    for (let item of data.keywords){
        keyword_data[item.text]=item
    }
     for (let item of data.entities){
       entity_data[item.text]=item
    }
    let keywords_desc = {}
    let entidades_desc = {}
    for (let keyword of keywords){
        let max=0;
        let emocion_predominante=null
        let emociones = keyword_data[keyword].emotion
        for(let emocion in emociones){
            if(emociones[emocion]>max){
                emocion_predominante=emocion
                max=emociones[emocion]
            }
        }
        let content={
            sentimiento: keyword_data[keyword].sentiment.label,
            relevancia: keyword_data[keyword].relevance,
            repeticiones: keyword_data[keyword].count,
            emocion: emocion_predominante
        }
        keywords_desc[keyword]=content
    }
    for (let entity of entities){
        let max=0;
        let emocion_predominante=null
        let emociones = entity_data[entity].emotion
        for(let emocion in emociones){
            if(emociones[emocion]>max){
                emocion_predominante=emocion
                max=emociones[emocion]
            }
        }
        let content={
            tipo:entity_data[entity].type,
            sentimiento:entity_data[entity].label,
            relevancia:entity_data[entity].relevance,
            emocion:emocion_predominante,
            repeticiones:entity_data[entity].count,
            porcentaje_confianza:entity_data[entity].confidence
        }
        entidades_desc[entity]=content
    }
    let response={
         "lenguaje_texto": data.language,
        "palabras_clave": keywords,
        "entidades": entities,
        "palabras_clave_desc": keywords_desc,
        "entidades_desc":entidades_desc
    }
    return response
 };

