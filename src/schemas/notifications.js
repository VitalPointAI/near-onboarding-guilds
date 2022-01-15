export const notificationSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "title": "Notifications",
    "properties": {
      "seeds": {
        "type": "array",
        "items": { "$ref": "#/definitions/Notifications" }
      }
    },
    "additionalProperties": false,
    "required": [ "seeds" ],
    "definitions": {
      "Notifications": {
        "type": "object",
        "properties": {
          "protected": { "type": "string" },
          "iv": { "type": "string" },
          "ciphertext": { "type": "string" },
          "tag": { "type": "string" },
          "aad": { "type": "string" },
          "recipients": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "header": { "type": "object" },
                "encrypted_key": { "type": "string" }
              },
              "required": [ "header", "encrypted_key" ]
            }
          }
        },
        "required": [ "protected", "iv", "ciphertext", "tag" ]
      }
    }
  }