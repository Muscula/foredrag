const path = require('path');
const fs = require('fs');
const Nunjucks = require('nunjucks');
const purifyCss = require('purify-css');
const htmlmin = require('html-minifier');
const Terser = require('terser');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy('img');
  eleventyConfig.addPassthroughCopy('favicon*');

  let nunjucksEnvironment = new Nunjucks.Environment(new Nunjucks.FileSystemLoader('_includes'));
  eleventyConfig.setLibrary('njk', nunjucksEnvironment);

  eleventyConfig.addNunjucksAsyncFilter('purifyCss', function (file, cb) {
    const css = fs.readFileSync(path.join(__dirname, file), 'utf-8');
    const html = fs.readFileSync(path.join(__dirname, this.ctx.page.inputPath), 'utf-8');
    purifyCss(html, css, { output: false, info: true, minify: true }, res =>
      cb(null, `<style>${res}</style>`),
    );
  });

  eleventyConfig.addFilter('load', function (file) {
    return fs.readFileSync(path.join(__dirname, file), 'utf-8');
  });

  eleventyConfig.addFilter('script', function (code) {
    return `<script type="text/javascript">${code}</script>`;
  });

  eleventyConfig.addFilter('jsmin', function (code) {
    let minified = Terser.minify(code);
    if (minified.error) {
      console.log('Terser error: ', minified.error);
      return code;
    }
    return minified.code;
  });

  // Minify HTML output
  eleventyConfig.addTransform('htmlmin', function (content, outputPath) {
    if (outputPath.indexOf('.html') > -1) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }
    return content;
  });
};
