export const definitionsSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Definitions",
    "type": "object",
    "properties": {
      "defs": {
        "type": "array",
        "items": { "$ref": "#/definitions/Definitions" }
      }
    },
    "additionalProperties": false,
    "required": [ "defs" ],
    "definitions": {
      "Definitions": {
        "type": "object",
        "properties": {
          "accountId": { "type": "string" },
          "alias": { "type": "string" },
          "def": { "type": "string" },
        },
        "required": [ "accountId", "alias", "def" ]
      }
    }
}