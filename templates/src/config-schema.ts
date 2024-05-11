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
    theme: {
      type: 'object',
      properties: {
        hue: {
          type: 'number',
          minimum: 0,
          maximum: 360,
        },
        saturation: {
          type: 'number',
          minimum: 0,
          maximum: 100,
        },
        lightness: {
          type: 'number',
          minimum: 0,
          maximum: 100,
        },
        pattern: {
          type: 'string',
          enum: ['noise', 'none'],
        },
        patternIntensity: {
          type: 'number',
          minimum: 0,
          maximum: 100,
        },
      },
      additionalProperties: false,
      required: ['hue', 'saturation', 'lightness', 'pattern', 'patternIntensity'],
    },
    icon: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['emoji'],
        },
        value: {
          type: 'string',
        },
      },
      additionalProperties: false,
      required: ['type', 'value'],
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
  required: ['title', 'description', 'theme', 'subdomain', 'domain', 'pages', 'icon'],
};

export default config;
