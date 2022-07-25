import { DocumentBuilder } from '@nestjs/swagger';
export declare class BaseAPIDocumentation {
    builder: DocumentBuilder;
    initializeOptions(): Omit<import("@nestjs/swagger").OpenAPIObject, "paths">;
}
