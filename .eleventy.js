// Imports
const pluginEleventyNavigation = require("@11ty/eleventy-navigation");
const pluginMinifier = require("@sherby/eleventy-plugin-files-minifier");
const pluginSitemap = require("@quasibit/eleventy-plugin-sitemap");
const Image = require("@11ty/eleventy-img");
const eleventyPluginSharpImages = require("@codestitchofficial/eleventy-plugin-sharp-images");
//const pluginAlpineJs = require("eleventy-plugin-alpinejs");

// Configs
const configCss = require("./src/config/css");
const configJs = require("./src/config/javascript");
const configSitemap = require("./src/config/sitemap");
const configServer = require("./src/config/server");

// Other
const filterPostDate = require("./src/config/postDate");
const isProduction = configServer.isProduction;

const now = String(Date.now())

module.exports = function (eleventyConfig) {
    /**=====================================================================
          EXTENSIONS - Recognising non-default languages as templates 
    =======================================================================*/
    /** https://www.11ty.dev/docs/languages/custom/ */

    /**
     *  CSS EXTENSION
     *  Setting up CSS files to be recognised as aN eleventy template language. This allows our minifier to read CSS files and minify them
     */
    eleventyConfig.addTemplateFormats("css");
    eleventyConfig.addExtension("css", configCss);

    eleventyConfig.addWatchTarget('./tailwind.config.js')


    /**
     *  JS EXTENSION
     *  Sets up JS files as an eleventy template language, which are compiled by esbuild. Allows bundling and minification of JS
     */
    eleventyConfig.addTemplateFormats("js");
    eleventyConfig.addExtension("js", configJs);



    /**=====================================================================
                                END EXTENSIONS
    =======================================================================*/


    /**=====================================================================
                  PLUGINS - Adds additional eleventy functionality 
    =======================================================================*/
    /** https://www.11ty.dev/docs/plugins/ */

    /**
     *  ELEVENTY NAVIGATION
     *  Sets up the eleventy navigation plugin for a scalable navigation as used in _includes/components/header.html
     *  https://github.com/11ty/eleventy-navigation
     */
    eleventyConfig.addPlugin(pluginEleventyNavigation);

    /**
     *  AUTOMATIC SITEMAP GENERATION 
     *  Automatically generate a sitemap, using the domain in _data/client.json
     *  https://www.npmjs.com/package/@quasibit/eleventy-plugin-sitemap
     */
    eleventyConfig.addPlugin(pluginSitemap, configSitemap);

    /**
     *  SHARP IMAGES 
     *  Automatically resize images using the sharp library
     *  https://github.com/codestitchofficial/eleventy-plugin-sharp-images
     */
    eleventyConfig.addPlugin(eleventyPluginSharpImages, {
        urlPath: "/assets/images",
        outputDir: "public/assets/images",
    });


    /**
     *  ALPINE JS 
     *  Adds Alpine JS to the HTML
     *  https://github.com/eleventy/eleventy-plugin-alpinejs    
     */
    /*eleventyConfig.addPlugin(pluginAlpineJs);*/



    /**
     *  MINIFIER 
     *  When in production ("npm run build" is ran), minify all HTML, CSS, JSON, XML, XSL and webmanifest files.
     *  https://github.com/benjaminrancourt/eleventy-plugin-files-minifier
     */
    if (isProduction) {
        eleventyConfig.addPlugin(pluginMinifier);
    }
    /**=====================================================================
                                END PLUGINS
    =======================================================================*/


    /**======================================================================
       PASSTHROUGHS - Copy source files to /public with no 11ty processing
    ========================================================================*/
    /** https://www.11ty.dev/docs/copy/ */

    eleventyConfig.addPassthroughCopy("./src/assets", {
        filter: [
            "**/*",
            "!**/*.js"
        ]
    });
    // Passthrough for CSS ? Unnecessary?
    //eleventyConfig.addPassthroughCopy("src/assets/css");
    //eleventyConfig.addWatchTarget('././src/assets/scss/tailwind.scss')
    eleventyConfig.addPassthroughCopy("./src/admin");
    eleventyConfig.addPassthroughCopy("./src/_redirects");
    /**=====================================================================
                              END PASSTHROUGHS
    =======================================================================*/

    /**======================================================================
               FILTERS - Modify data in template files at build time
    ========================================================================*/
    /** https://www.11ty.dev/docs/filters/ */

    /**
     *  Converts dates from JSDate format (Fri Dec 02 18:00:00 GMT-0600) to a locale format.
     *  Use - {{ "DATE GOES HERE" | postDate }}
     *  https://moment.github.io/luxon/api-docs/index.html#datetime
     */
    eleventyConfig.addFilter("postDate", filterPostDate);
    /**=====================================================================
                                    END FILTERS
    =======================================================================*/

    /**======================================================================
                  SHORTCODES - Output data using JS at build time
    ========================================================================*/
    /** https://www.11ty.dev/docs/shortcodes/ */

    /**
     *  Gets the current year, which can be outputted with {% year %}. Used for the footer copyright. Updates with every build.
     *  Use - {% year %}
     */
    eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);


    /**
     *  Optimizes images
     *  Use - {% year %}
     */

	eleventyConfig.addShortcode("image", async function (src, alt, widths = [300, 600], sizes = "100vh") {
		let metadata = await Image(src, {
			widths,
			formats: ["avif", "jpeg"],
		});

		let imageAttributes = {
			alt,
			sizes,
			loading: "lazy",
			decoding: "async",
		};

		let options = {
			// HTML attributes added to `<picture>` (left out if <img> is used)
			// Added in v4.0.0
			pictureAttributes: {},

			// Condense HTML output to one line (no new lines)
			// Added in v0.7.3
			whitespaceMode: "inline", // or: "block"
		};

		// You bet we throw an error on a missing alt (alt="" works okay)
		return Image.generateHTML(metadata, imageAttributes);
	});


    eleventyConfig.addNunjucksAsyncShortcode("footerYear", async () => `${new Date().getFullYear()}`);

    /**=====================================================================
                                END SHORTCODES
    =======================================================================*/

    /**=====================================================================
                                SERVER SETTINGS
    =======================================================================*/
    eleventyConfig.setServerOptions(configServer);
    /**=====================================================================
                              END SERVER SETTINGS
    =======================================================================*/

    return {
        dir: {
            input: "src",
            output: "public",
            includes: "_includes",
            data: "_data",
        },
        htmlTemplateEngine: "njk",
    };
};
