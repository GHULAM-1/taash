// src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with credentials
  app.enableCors({
    origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
    credentials: true, // Important for cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "Set-Cookie"],
  });

  const port = process.env.PORT ? +process.env.PORT : 3000;
  await app.listen(port, "0.0.0.0");
  console.log(`🚀  Server listening on http://0.0.0.0:${port}`);
}
bootstrap();
