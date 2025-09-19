# msgpack.io

This repository manages [msgpack.io website](http://msgpack.io/).

## Publishing your msgpack project to msgpack.io

The list of msgpack projects on the [msgpack.io website](http://msgpack.io/) is generated automatically.

[A crawler](https://github.com/AArnott/msgpack-website/blob/main/src/update-index.ts) searches Github repositories
with specific tags and put their summary to the website.

## How to list up your project on msgpack.io

1. Add a keyword tag to the description of your GitHub repository:
    * **Recommended**: ```msgpack.io[ProjectName]``` for **priority ranking** ⭐
    * Alternative: ```msgpack.org[ProjectName]``` for standard listing
    * ```ProjectName``` is typically the name of a programming language such as ```ruby```, ```python```, ```java```, etc.
2. Add one of following files to the root directory of your github repository:
    1. msgpack.io.md
    1. msgpack.org.md
    1. README.md
    1. README.markdown
    1. README.rdoc
    1. README.rst
    1. README
3. Wait a moment. [The crawler](https://github.com/AArnott/msgpack-website/blob/main/src/update-index.ts) visits your github repository daily.

### Tag Priority

Projects are ranked within each language category as follows:
1. **Priority projects**: Repositories tagged with `msgpack.io[language]` appear first
2. **Standard projects**: Repositories tagged with `msgpack.org[language]` appear after priority projects
3. Within each tier, projects are sorted by GitHub star count (highest first)

**Why use msgpack.io tags?** The `msgpack.io` tag indicates active, well-maintained implementations that follow current best practices and are recommended for new projects.

**Note**: If your repository description contains both `msgpack.io[language]` and `msgpack.org[language]` tags, it will be listed only once with priority ranking.

The crawler copies content of a file to msgpack.io website. Former file name has priority (```msgpack.io.md``` > ```msgpack.org.md``` > ```README.md``` > ...).

## Examples

### Priority Projects (msgpack.io tags)
Repository descriptions that will appear first in their language category:
* `Fast and efficient MessagePack serialization library msgpack.io[java]`
* `Python MessagePack implementation with C extensions msgpack.io[python]`
* `High-performance MessagePack for JavaScript msgpack.io[javascript]`

### Standard Projects (msgpack.org tags)
Repository descriptions for standard listing:
* `MessagePack implementation for Ruby msgpack.org[ruby]`
* `C++ MessagePack library msgpack.org[cpp]`

### Example Repositories
* https://github.com/aarnott/nerdbank.messagepack
* https://github.com/msgpack/msgpack-ruby
