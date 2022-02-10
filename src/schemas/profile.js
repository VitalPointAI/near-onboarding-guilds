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
      intro: {
        type: 'string',
        maxLength: 2000,
      },
      shortBio: {
        type: 'string',
        maxLength: 4000,
      },
      birthdate: {
        type: 'string'
      },
      email: {
        description: 'Email of profile owner',
        type: 'string',
        format: 'email'
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
      telegram: {
        type: 'string'
      },
      website: {
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
      "nftContract": {
        type: 'string'
      },
      "profileNft": {
        type: 'string'
      },
      "nftTokenId": {
        type: 'string'
      },
      "likes": {
        type: 'array'
      },
      "dislikes": {
        type: 'array'
      },
      "neutrals": {
        type: 'array'
      },
    },
  }