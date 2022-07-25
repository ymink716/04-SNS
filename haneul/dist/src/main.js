"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app/app.module");
const cookieParser = require("cookie-parser");
const swaggerConfig_1 = require("../config/swaggerConfig");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { cors: true });
    app.setGlobalPrefix('/api');
    app.use(cookieParser());
    app.useGlobalPipes(new common_1.ValidationPipe());
    const documentOptions = new swaggerConfig_1.BaseAPIDocumentation().initializeOptions();
    const document = swagger_1.SwaggerModule.createDocument(app, documentOptions);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.listen(3001);
}
bootstrap();
//# sourceMappingURL=main.js.map