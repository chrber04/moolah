// @ts-check

/** @type {import("syncpack").RcFile} */
const config = {
  versionGroups: [
    {
      dependencies: ["@moolah/**"],
      packages: ["**"],
      isIgnored: true,
    },
    {
      dependencies: ["nanoid"],
      packages: ["**"],
      isIgnored: true,
    },
  ],
  sortFirst: [
    "name",
    "description",
    "version",
    "author",
    "private",
    "license",
    "type",
    "sideEffects",
    "main",
    "imports",
    "module",
    "types",
    "exports",
    "files",
    "scripts",
    "peerDependencies",
    "dependencies",
    "devDependencies",
  ],
  sortAz: [
    "contributors",
    "dependencies",
    "devDependencies",
    "keywords",
    "peerDependencies",
    "resolutions",
  ],
};

module.exports = config;
