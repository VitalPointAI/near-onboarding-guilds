// schemas
import { profileSchema } from '../schemas/profile'
import { guildProfileSchema } from '../schemas/guildProfile'
import { accountKeysSchema } from '../schemas/accountKeys'
import { definitionsSchema } from '../schemas/definitions'
import { schemaSchema } from '../schemas/schemas'
import { commentsSchema } from '../schemas/comments'
import { notificationSchema } from '../schemas/notifications'
import { metadataSchema } from '../schemas/metadata'
import { apiKeysSchema } from '../schemas/apiKeys'
import { announcementSchema } from '../schemas/announcements'
import { opportunitiesSchema } from '../schemas/opportunities'
import { daoProfileSchema } from '../schemas/daoProfile'
import { nearPriceHistorySchema } from '../schemas/nearPriceHistory'
import { nearTransactionHistorySchema } from '../schemas/nearTransactionHistory'
import { yearPriceHistorySchema } from '../schemas/yearPriceHistory'
import { yearTransactionHistorySchema } from '../schemas/yearTransactionHistory'

import { config } from '../state/config.js'
const {
    APP_OWNER_ACCOUNT
} = config

export const aliasData = [
    {
      schemaName: 'Definitions',
      schemaDescription: 'alias definitions',
      schema: definitionsSchema,
      definitionName: 'Definitions',
      definitionDescription: 'alias definitions',
      accountId: APP_OWNER_ACCOUNT,
      appName: 'Guilds'
    },
    {
      schemaName: 'Schemas',
      schemaDescription: 'user schemas',
      schema: schemaSchema,
      definitionName: 'Schemas',
      definitionDescription: 'user schemas',
      accountId: APP_OWNER_ACCOUNT,
      appName: 'Guilds'
    },
    {
      schemaName: 'profile',
      schemaDescription: 'persona profiles',
      schema: profileSchema,
      definitionName: 'profile',
      definitionDescription: 'persona profiles',
      accountId: APP_OWNER_ACCOUNT,
      appName: 'Guilds'
    },
    {
      schemaName: 'accountsKeys',
      schemaDescription: 'user account info',
      schema: accountKeysSchema,
      definitionName: 'accountsKeys',
      definitionDescription: 'user account info',
      accountId: APP_OWNER_ACCOUNT,
      appName: 'Guilds'
    },
    {
      schemaName: 'comments',
      schemaDescription: 'comments',
      schema: commentsSchema,
      definitionName: 'comments',
      definitionDescription: 'comments',
      accountId: APP_OWNER_ACCOUNT,
      appName: 'Guilds'
    },
    {
      schemaName: 'notifications',
      schemaDescription: 'notifications',
      schema: notificationSchema,
      definitionName: 'notifications',
      definitionDescription: 'notifications',
      accountId: APP_OWNER_ACCOUNT,
      appName: 'Guilds'
    },
    {
      schemaName: 'guildProfile',
      schemaDescription: 'guild profiles',
      schema: guildProfileSchema,
      definitionName: 'guildProfile',
      definitionDescription: 'guild profiles',
      accountId: APP_OWNER_ACCOUNT,
      appName: 'Guilds'
    },
    {
      schemaName: 'apiKeys',
      schemaDescription: 'guild api keys',
      schema: apiKeysSchema,
      definitionName: 'apiKeys',
      definitionDescription: 'guild api keys',
      accountId: APP_OWNER_ACCOUNT,
      appName: 'Guilds'
    },
    {
      schemaName: 'announcements',
      schemaDescription: 'guild announcements',
      schema: announcementSchema,
      definitionName: 'announcements',
      definitionDescription: 'guild announcements',
      accountId: APP_OWNER_ACCOUNT,
      appName: 'Guilds'
    },
    {
      schemaName: 'opportunities',
      schemaDescription: 'opportunities offered',
      schema: opportunitiesSchema,
      definitionName: 'opportunities',
      definitionDescription: 'opportunities offered',
      accountId: APP_OWNER_ACCOUNT,
      appName: 'Guilds'
    },
    {
      schemaName: 'daoProfile',
      schemaDescription: 'community project and dao profiles',
      schema: daoProfileSchema,
      definitionName: 'daoProfile',
      definitionDescription: 'community project and dao profiles',
      accountId: APP_OWNER_ACCOUNT,
      appName: 'Guilds'
    },
    {
      schemaName: 'nearTransactionHistory',
      schemaDescription: 'near account transaction history',
      schema: nearTransactionHistorySchema,
      definitionName: 'nearTransactionHistory',
      definitionDescription: 'near account transaction history',
      accountId: APP_OWNER_ACCOUNT,
      appName: 'Guilds'
    },
    {
      schemaName: 'nearPriceHistory',
      schemaDescription: 'daily historical prices of NEAR',
      schema: nearPriceHistorySchema,
      definitionName: 'nearPriceHistory',
      definitionDescription: 'daily historical prices of NEAR',
      accountId: APP_OWNER_ACCOUNT,
      appName: 'Guilds'
    }
  ]