"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAPIDocumentation = void 0;
import swagger_1 from "@nestjs/swagger";
class BaseAPIDocumentation {
    constructor() {
        this.builder = new swagger_1.DocumentBuilder();
    }
    initializeOptions() {
        return this.builder
            .setTitle('SNS API Server')
            .setDescription('SNS API 서버입니다.')
            .setVersion('1.0')
            .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            name: 'access_token',
            description: 'access token을 입력하세요.',
            in: 'header',
        }, 'access_token')
            .build();
    }
}
exports.BaseAPIDocumentation = BaseAPIDocumentation;
//# sourceMappingURL=swaggerDocs.js.map