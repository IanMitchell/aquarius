const withMDX = require('@next/mdx')({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

module.exports = {
  ...withMDX({
    pageExtensions: ['js', 'mdx'],
  }),
  experimental: {
    reactRefresh: true,
  },
};
