export const profileSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Profile',
    type: 'object',
    properties: {
      date: {
        type: 'string',
      },
      owner: {
        type: 'string',
      },
      name: {
          type: 'string',
      },
      avatar: {
        type: 'string',
      },
      shortBio: {
        type: 'string',
        title: 'text',
        maxLength: 4000,
      },
      birthdate: {
        type: 'string'
      },
      email: {
        type: 'string'
      },
      reddit: {
        type: 'string'
      },
      twitter: {
        type: 'string'
      },
      discord: {
        type: 'string'
      },
      country: {
        type: 'string'
      },
      language: {
        type: 'array'
      },
      familiarity: {
        type: 'string'
      },
      skillSet: {
        type: 'object'
      },
      developerSkillSet: {
        type: 'object'
      },
      notifications: {
        type: 'array'
      },
      "personaSkills": {
        type: "array"
      },
      "personaSpecificSkills": {
        type: "array"
      },
    },
  }