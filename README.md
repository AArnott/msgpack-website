# msgpack.io

This repository manages [msgpack.io website](http://msgpack.io/).

## Publishing your msgpack project to msgpack.io

The list of msgpack projects on the [msgpack.io website](http://msgpack.io/) is generated automatically.

[A crawler](https://github.com/AArnott/msgpack-website/blob/main/update-index.rb) searches Github repositories
with a specific tag and put their summary to the website.

## How to list up your project on msgpack.io

1. Add the keyword ```msgpack.org[ProjectName]``` to description of your github repository
    * ```ProjectName``` is typically name of a programming language such as ```ruby```
2. Add one of following files to the root directory of your github repository:
    1. msgpack.org.md
    2. README.md
    3. README.markdown
    4. README.rdoc
    5. README.rst
    6. README
3. Wait a moment. [The crawler](https://github.com/AArnott/msgpack-website/blob/main/update-index.rb) visits your github repository every hour.

The crawler copies content of a file to msgpack.io website. Former file name has priority (```msgpack.org.md``` > ```README.md``` > ...).

## Examples

* https://github.com/msgpack/msgpack-java
* https://github.com/msgpack/msgpack-ruby
