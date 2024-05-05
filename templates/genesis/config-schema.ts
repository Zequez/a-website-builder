import { JSONSchemaType } from 'ajv';

export const page: JSONSchemaType<Page> = {
  type: 'object',
  properties: {
    uuid: {
      type: 'string',
    },
    path: {
      type: 'string',
      pattern: '^[a-zA-Z0-9_\\-/]+$',
    },
    title: {
      type: 'string',
    },
    icon: {
      type: 'string',
    },
    onNav: {
      type: 'boolean',
    },
    content: {
      type: 'string',
    },
  },
  required: ['title', 'content', 'uuid', 'path', 'icon', 'onNav'],
  additionalProperties: false,
};

const config: JSONSchemaType<Config> = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    themeColor: {
      type: 'string',
    },
    domain: {
      type: 'string',
    },
    subdomain: {
      type: 'string',
    },
    pages: {
      type: 'array',
      items: page,
    },
  },
  additionalProperties: false,
  required: ['title', 'description', 'subdomain', 'domain', 'themeColor', 'pages'],
};

export default config;
