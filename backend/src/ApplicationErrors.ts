/*
   src/ApplicationErrors.ts
*/

export class BaseError extends Error {
    constructor(message: string, skipFrames?: Function) {
        super(message);
        delete this.stack;
    }
}
export class LoginError extends BaseError {}