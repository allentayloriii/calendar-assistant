export default {
  providers: [
    {
      domain:
        process.env.CONVEX_SITE_URL ||
        process.env.VITE_CONVEX_URL ||
        "http://localhost:3000",
      applicationID: "convex",
    },
  ],
};
