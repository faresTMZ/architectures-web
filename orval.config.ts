export default {
  gourmet: {
    output: {
      target: "./src/gourmet.ts",
      client: "fetch",
      baseUrl: "https://gourmet.cours.quimerch.com",
      override: {
        mutator: {
          path: "./src/orvalCustomClient.ts",
          name: "httpClient",
        },
      },
    },
    input: {
      target: "https://gourmet.cours.quimerch.com/swagger/openapi.json",
    },
  },
};
