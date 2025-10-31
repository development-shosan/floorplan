/*
   src/ApplicationErrors.ts
*/

export class BaseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        delete this.stack;
    }
}
export class LoginError extends BaseError {}
export class UserModificationError extends BaseError {}
export class FloorplanGenerationError extends BaseError {}
export class FloorplanGenerationNotCompletedError extends BaseError {}
export class FloorplanImageError extends BaseError {}
