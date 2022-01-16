export const metadataSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Metadata',
    type: 'object',
    properties: {
      tokenId: {
        type: 'string'
      },
      title: {
        type: 'string',
      },
      media: {
          type: 'array',
      },
      images: {
        type: 'array',
      },
      description: {
        type: 'string',
        title: 'text',
        maxLength: 4000,
      },
      copies: {
        type: 'string'
      },
      issuedAt: {
        type: 'number'
      },
      expiresAt: {
        type: 'number'
      },
      startsAt: {
        type: 'number'
      },
      updatedAt: {
        type: 'number'
      },
      extra: {
        type: 'string'
      },
      reference: {
        type: 'array'
      },
    },
  }