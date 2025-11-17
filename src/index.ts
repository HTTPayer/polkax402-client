import express from "express";
import dotenv from "dotenv";
import polkaNewsRoute from "./routes/polkaNewsRoute";
import swaggerUi from "swagger-ui-express";
import openapiSpec from "../docs/openapi.json";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api", polkaNewsRoute);

// Swagger UI at /docs — hide the default topbar that shows "Swagger"
const swaggerOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Polkax402 API Docs",
};
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec as any, swaggerOptions));

app.get("/", (req, res) => {
  res.send({ ok: true, service: "polkax402" });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  console.log(`polkax402 listening on http://localhost:${port}`);
});
