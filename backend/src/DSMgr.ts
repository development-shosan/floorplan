/*
   src/DSMgr.ts
*/
import DBMgr from './DBMgr';
import { LoginResult } from './Types/LoginParam';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AppConstant } from './SpecificCommons';
import { LoginError } from './ApplicationErrors';

export default class DSMgr {
    private dbMgr: DBMgr;

    constructor() {
        this.dbMgr = new DBMgr();
    }

    /**
     * Login authentication.
     *
     * @param email - email address
     * @param password - user password
     * @return Object<LoginResult>
     */
    public async login( email: string, password: string ): Promise<LoginResult> {
        try {
            const user = await this.dbMgr.getUserByEmail(email);
            // The password column allows NULL values.
            if (!user || !user.password) {
                throw new LoginError('The email is incorrect.');
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new LoginError('The password is incorrect.');
            }

            const token = jwt.sign(
                {},
                AppConstant.JWT.SECRET,
                { expiresIn: '1h' }
            );

            return {
                id: user.id,
                name: user.name || '',
                role: user.role,
                token
            };
        } catch (err) {
            if (err instanceof LoginError) {
                console.error('Login failed', err);
            }
            throw err;
        }
    }
}