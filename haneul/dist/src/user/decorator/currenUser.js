"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../user.entity");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user instanceof user_entity_1.User ? request.user : null;
});
//# sourceMappingURL=currenUser.js.map