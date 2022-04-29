export const daoProfileSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Profile',
    type: 'object',
    properties: {
      "contractId": {
        "type": "string",
      },
      "summoner": {
        "type": "string",
      },
      "date": {
        "type": "string",
      },
      "category": {
        "type": "string",
      },
      "name": {
          "type": "string",
      },
      "logo": {
        "type": "string",
      },
      "purpose": {
        "type": "string",
        "title": "text",
        "maxLength": 4000,
      },
      country: {
        type: 'string'
      },
      language: {
        type: 'array'
      },
      "email":{
        type: 'string'
      },
      "discord":{
        type: 'string'
      },
      "telegram":{
        type: 'string'
      },
      "reddit": {
        type: 'string'
      },
      "website": {
        type: 'string'
      },
      "twitter": {
        type: "string"
      },
      "skills": {
        type: "array"
      },
      "specificSkills": {
        type: "array"
      },
      "platform": {
        type: 'string'
      },
      "did": {
        type: 'string'
      }
   },
  }