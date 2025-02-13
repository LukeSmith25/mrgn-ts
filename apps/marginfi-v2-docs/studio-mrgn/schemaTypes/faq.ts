import { defineField, defineType } from 'sanity'


// This schema defines the structure for an FAQ (Frequently Asked Questions) document in Sanity Studio
export const faqType = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tag',
      title: 'Tag',
      type: 'string',
      options: { list: ['General', 'Lending', 'Borrowing', 'Staking', 'Technical'] },
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
    }),
  ],
})
