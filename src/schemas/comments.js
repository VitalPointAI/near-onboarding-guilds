export const commentsSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Comments",
  "required": [ "comments" ],
  "properties": {
    "comments": {
      "type": "array",
      "items": { "$ref": "#/definitions/Comments" }
    }
  },
  "additionalProperties": false,
  "definitions": {
    "Comments": {
      "type": "object",
      "required": ["commentId"],
      properties: {
        commentId: {
          type: 'string',
        },
        contractId: {
          type: 'string',
        },
        parent: {
          type: 'string',
        },
        subject: {
          type: 'string',
        },
        body: {
          type: 'string',
        },
        author: {
          type: 'string',
        },
        postDate: {
          type: 'number',
          minimum: 0,
        },
        published: {
          type: 'boolean'
        },
        originalAuthor: {
          type: 'string'
        },
        originalContent: {
          type: 'string'
        }
      }
    }
  }
}