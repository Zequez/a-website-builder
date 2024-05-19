/* GENERATED */

export const TextElementConfig = {
  "$id": "TextElementConfig",
  "type": "object",
  "properties": {
    "uuid": {
      "type": "string"
    },
    "type": {
      "type": "string",
      "enum": [
        "Text"
      ]
    },
    "value": {
      "type": "string"
    },
    "compiledValue": {
      "type": "string"
    },
    "boxColor": {
      "type": "string"
    }
  },
  "required": [
    "uuid",
    "type",
    "value",
    "compiledValue",
    "boxColor"
  ],
  "additionalProperties": false
};
export const PageConfig = {
  "$id": "PageConfig",
  "type": "object",
  "properties": {
    "uuid": {
      "type": "string"
    },
    "path": {
      "type": "string"
    },
    "title": {
      "type": "string"
    },
    "icon": {
      "type": "string"
    },
    "onNav": {
      "type": "boolean"
    },
    "elements": {
      "type": "array",
      "items": {
        "$ref": "PageElementConfig"
      }
    }
  },
  "required": [
    "title",
    "uuid",
    "path",
    "icon",
    "onNav",
    "elements"
  ],
  "additionalProperties": false
};
export const PageElementConfig = {
  "$id": "PageElementConfig",
  "anyOf": [
    {
      "$ref": "TextElementConfig"
    },
    {
      "$ref": "ImageElementConfig"
    }
  ]
};
export const ImageElementConfig = {
  "$id": "ImageElementConfig",
  "type": "object",
  "properties": {
    "uuid": {
      "type": "string"
    },
    "type": {
      "type": "string",
      "enum": [
        "Image"
      ]
    },
    "url": {
      "type": "object",
      "properties": {
        "large": {
          "type": "string"
        },
        "medium": {
          "type": "string"
        },
        "small": {
          "type": "string"
        }
      },
      "required": [
        "large",
        "medium",
        "small"
      ],
      "additionalProperties": false
    },
    "displaySize": {
      "type": "string",
      "enum": [
        "original",
        "1/3",
        "1/2",
        "2/3",
        "extra"
      ]
    },
    "originalSize": {
      "type": "object",
      "properties": {
        "width": {
          "type": "number"
        },
        "height": {
          "type": "number"
        }
      },
      "required": [
        "width",
        "height"
      ],
      "additionalProperties": false
    }
  },
  "required": [
    "uuid",
    "type",
    "url",
    "displaySize",
    "originalSize"
  ],
  "additionalProperties": false
};
export const Config = {
  "$id": "Config",
  "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "description": {
      "type": "string"
    },
    "theme": {
      "type": "object",
      "properties": {
        "hue": {
          "type": "number",
          "minimum": 0,
          "maximum": 360
        },
        "saturation": {
          "type": "number",
          "minimum": 0,
          "maximum": 100
        },
        "lightness": {
          "type": "number",
          "minimum": 0,
          "maximum": 100
        },
        "pattern": {
          "type": "string",
          "enum": [
            "noise",
            "none"
          ]
        },
        "patternIntensity": {
          "type": "number",
          "minimum": 0,
          "maximum": 100
        }
      },
      "additionalProperties": false,
      "required": [
        "hue",
        "saturation",
        "lightness",
        "pattern",
        "patternIntensity"
      ]
    },
    "icon": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "emoji"
          ]
        },
        "value": {
          "type": "string"
        }
      },
      "additionalProperties": false,
      "required": [
        "type",
        "value"
      ]
    },
    "domain": {
      "type": "string"
    },
    "subdomain": {
      "type": "string"
    },
    "pages": {
      "type": "array",
      "items": {
        "$ref": "PageConfig"
      }
    }
  },
  "additionalProperties": false,
  "required": [
    "title",
    "description",
    "theme",
    "subdomain",
    "domain",
    "pages",
    "icon"
  ]
};