const config = {
  preset: "eslint",
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        releaseRules: [
          { tag: "PATCH", release: "patch" },
          { tag: "MINOR", release: "minor" },
          { tag: "MAJOR", release: "major" },
        ],
        parserOpts: {
          headerPattern: /^(PATCH|MINOR|MAJOR): (.*)$/,
          headerCorrespondence: ["tag", "subject"],
        },
      },
    ],
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/npm",
      {
        tarballDir: "release",
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: "release/*.tgz",
      },
    ],
    "@semantic-release/git",
  ],
  branches: [
    {
      name: "develop",
      channel: "next",
      prerelease: "rc",
    },
    {
      name: "release/[0-9]+(.[0-9]+)?.(x|X)",
      channel: '${name.replace(/^release\\//g, "")}',
      range: '${name.replace(/^release\\//g, "")}',
    },
    "main",
  ],
};

const branch = process.env.GITHUB_REF.split("/").pop();

if (branch === "main") {
  config.plugins.splice(2, 0, "@semantic-release/changelog");
}

module.exports = config;
