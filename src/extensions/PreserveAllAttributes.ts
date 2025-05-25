import { Extension } from '@tiptap/core'

export const PreserveAllAttributes = Extension.create({
  name: 'preserveAllAttributes',

  addGlobalAttributes() {
    return [
      {
        // All text formatting elements
        types: ['textStyle', 'bold', 'italic', 'strike', 'underline', 'code', 'subscript', 'superscript'],
        attributes: {
          style: {
            default: null,
            parseHTML: element => element.getAttribute('style'),
            renderHTML: attributes => {
              if (!attributes.style) {
                return {}
              }
              return {
                style: attributes.style,
              }
            },
          },
          class: {
            default: null,
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => {
              if (!attributes.class) {
                return {}
              }
              return {
                class: attributes.class,
              }
            },
          },
        },
      },
      {
        // Block level elements
        types: ['paragraph', 'heading', 'blockquote', 'codeBlock', 'horizontalRule'],
        attributes: {
          style: {
            default: null,
            parseHTML: element => element.getAttribute('style'),
            renderHTML: attributes => {
              if (!attributes.style) {
                return {}
              }
              return {
                style: attributes.style,
              }
            },
          },
          class: {
            default: null,
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => {
              if (!attributes.class) {
                return {}
              }
              return {
                class: attributes.class,
              }
            },
          },
        },
      },
      {
        // List elements
        types: ['bulletList', 'orderedList', 'listItem'],
        attributes: {
          style: {
            default: null,
            parseHTML: element => element.getAttribute('style'),
            renderHTML: attributes => {
              if (!attributes.style) {
                return {}
              }
              return {
                style: attributes.style,
              }
            },
          },
          class: {
            default: null,
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => {
              if (!attributes.class) {
                return {}
              }
              return {
                class: attributes.class,
              }
            },
          },
        },
      },
      {
        // Media and interactive elements
        types: ['image', 'link'],
        attributes: {
          style: {
            default: null,
            parseHTML: element => element.getAttribute('style'),
            renderHTML: attributes => {
              if (!attributes.style) {
                return {}
              }
              return {
                style: attributes.style,
              }
            },
          },
          class: {
            default: null,
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => {
              if (!attributes.class) {
                return {}
              }
              return {
                class: attributes.class,
              }
            },
          },
        },
      },
      {
        // Table elements
        types: ['table', 'tableRow', 'tableCell', 'tableHeader'],
        attributes: {
          style: {
            default: null,
            parseHTML: element => element.getAttribute('style'),
            renderHTML: attributes => {
              if (!attributes.style) {
                return {}
              }
              return {
                style: attributes.style,
              }
            },
          },
          class: {
            default: null,
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => {
              if (!attributes.class) {
                return {}
              }
              return {
                class: attributes.class,
              }
            },
          },
        },
      },
    ]
  },
})
