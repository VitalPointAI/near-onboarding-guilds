export const announcementSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Announcement',
    type: 'object',
    properties: {
      "adminId": {
        "type": "string",
      },
      "subject": {
        "type": "string",
      },
      "message": {
        "type": "string",
      },
      "date": {
        type: "string"
      },
   },
  }