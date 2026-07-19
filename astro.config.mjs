import { defineConfig } from "astro/config";

const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  site: "https://monkix.github.io",
  base: isGitHubPages ? "/thai-people-history" : "/",
  output: "static",
});
