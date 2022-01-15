export const schemaSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "title": "Schemas",
    "properties": {
      "schemas": {
        "type": "array",
        "items": { "$ref": "#/definitions/Schemas" }
      }
    },
    "additionalProperties": false,
    "required": [ "schemas" ],
    "definitions": {
      "Schemas": {
        "type": "object",
        "properties": {
          "accountId": { "type": "string" },
          "name": { "type": "string" },
          "url": { "type": "string" },
        },
        "required": [ "accountId", "name", "url" ]
      },
    }
}