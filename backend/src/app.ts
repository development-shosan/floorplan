/*
   src/app.ts
*/
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import DSMgr from './DSMgr';
import {
    UserModificationError,
    LoginError,
    FloorplanGenerationError,
    FloorplanGenerationNotCompletedError,
    FloorplanImageError
} from './ApplicationErrors';
import morgan from 'morgan';
import cors from 'cors';
import { body, param } from 'express-validator';
import { refreshTokenIfValid, authorizeRoles } from './middlewares/auth.middleware';
import { validatorErrorChecker } from './middlewares/validator.middleware';
import { AuthTokenPayload } from './Types/LoginParam';
import { env } from '../env';
import { Role } from '@prisma/client';
import multer from 'multer';
import { AppConstant } from './SpecificCommons';

const app = express();
const router = express.Router();
const PORT = env.WEB_SERVER_PORT;
const dsMgr = new DSMgr();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: AppConstant.FLOORPLAN.IMAGE.MAX_FILE_SIZE // 5MB
    }
});

// cross-origin resource sharing
app.use(
    cors({
        origin: true
    })
);
// JSONボディパーサーを有効にする
app.use(express.json());
// HTTP log output
app.use(morgan('dev'));
// prefix URI
app.use('/api/v1', router);

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
    res.status(200).send('Backend is healthy!');
});

// ルートエンドポイント
app.get('/', (req, res) => {
    res.send('Hello from Backend!');
});

/**
 *  Login authentication.
 *      Request param:
 *          curl -i -X POST -H "Content-Type: application/json"
 *               -d "{\"email\":\"user@example.com\",\"password\":\"1234\"}" http://localhost:4000/api/v1/login
 *
 *      Response: Object<LoginResult>
 */
router.post(
    '/login',
    body('email').trim().notEmpty().isEmail().normalizeEmail(),
    body('password').notEmpty().isString(),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await dsMgr.login(req.body.email, req.body.password);
            res.json(result);
        } catch (err) {
            if (err instanceof LoginError) {
                res.sendStatus(401);
            } else {
                res.sendStatus(500);
            }
            return next(err);
        }
    }
);

/**
 *  Retrieves a list of users.
 *      Request param:
 *          curl -i -X GET -H "Authorization: TOKEN" http://localhost:4000/api/v1/members
 *
 *      Response: Object<UserInfoOutput>
 */
router.get(
    '/members',
    refreshTokenIfValid,
    authorizeRoles(Role.SYSTEM_ADMIN, Role.COMPANY_ADMIN),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authPayload: AuthTokenPayload | undefined = req.user;
            if (!authPayload) {
                res.status(403).send('No payload found in token');
                return;
            }

            const result = await dsMgr.getUsers(authPayload);
            res.json(result);
        } catch (err) {
            res.sendStatus(500);
            return next(err);
        }
    }
);

/**
 *  Creates a new user.
 *      Request param:
 *          curl -i -X POST -H "Content-Type: application/json" -H "Authorization: TOKEN"
 *          -d "{\"name\":\"渡辺\", \"companyId\":2, \"email\":\"user2@example.com\",
 *          \"password\":\"1234\", \"role\":\"MEMBER\", \"department\":\"営業\",
 *          \"phoneNumber\":\"090-1111-2222\"}" http://localhost:4000/api/v1/member
 *
 */
router.post(
    '/member',
    [
        body('name').trim().notEmpty().isString(),
        body('companyId').notEmpty().toInt().isInt({ min: 1 }),
        body('email').trim().notEmpty().isEmail().normalizeEmail(),
        body('password').notEmpty().isString(),
        body('role').trim().notEmpty().isString(),
        body('department').trim().notEmpty().isString(),
        body('phoneNumber').notEmpty().isString()
    ],
    refreshTokenIfValid,
    authorizeRoles(Role.SYSTEM_ADMIN, Role.COMPANY_ADMIN),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authPayload: AuthTokenPayload | undefined = req.user;
            if (!authPayload) {
                res.sendStatus(403);
                return;
            }

            await dsMgr.createUser(req.body, authPayload);
            res.sendStatus(200);
        } catch (err) {
            if (err instanceof UserModificationError) {
                res.sendStatus(406);
            } else {
                res.sendStatus(500);
            }
            return next(err);
        }
    }
);

/**
 *  Updates user data.
 *      Request param:
 *          curl -i -X PUT -H "Content-Type: application/json" -H "Authorization: TOKEN"
 *          -d "{\"name\":\"渡辺\", \"role\":\"MEMBER\", \"department\":\"営業\",
 *          \"phoneNumber\":\"090-1111-2222\", \"status\":true}" http://localhost:4000/api/v1/member/32
 *
 */
router.put(
    '/member/:id',
    [
        param('id').exists().isNumeric(),
        body('name').trim().notEmpty().isString(),
        body('role').trim().notEmpty().isString(),
        body('department').trim().notEmpty().isString(),
        body('phoneNumber').trim().notEmpty().isString(),
        body('status').notEmpty().isBoolean()
    ],
    refreshTokenIfValid,
    authorizeRoles(Role.SYSTEM_ADMIN, Role.COMPANY_ADMIN),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authPayload: AuthTokenPayload | undefined = req.user;
            if (!authPayload) {
                res.sendStatus(403);
                return;
            }
            const userId = Number(req.params.id);
            await dsMgr.updateUser(userId, authPayload, req.body);
            res.sendStatus(200);
        } catch (err) {
            if (err instanceof UserModificationError) {
                res.sendStatus(406);
            } else {
                res.sendStatus(500);
            }
            return next(err);
        }
    }
);

/**
 * Changes the user's password.
 * Request param:
 *          curl -i -X PATCH -H "Content-Type: application/json" -H "Authorization: TOKEN"
 *         -d "{\"newPassword\":\"12345\"}" http://localhost:4000/api/v1/password/32
 *
 */
router.patch(
    '/password/:id',
    [param('id').exists().isNumeric(), body('newPassword').notEmpty().isString()],
    refreshTokenIfValid,
    authorizeRoles(Role.SYSTEM_ADMIN, Role.COMPANY_ADMIN),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authPayload: AuthTokenPayload | undefined = req.user;
            if (!authPayload) {
                res.sendStatus(403);
                return;
            }

            const userId = Number(req.params.id);
            await dsMgr.changeUserPassword(userId, authPayload, req.body.newPassword);
            res.sendStatus(200);
        } catch (err) {
            if (err instanceof UserModificationError) {
                res.sendStatus(406);
            } else {
                res.sendStatus(500);
            }
            return next(err);
        }
    }
);

/**
 *  Retrieves a list of companies.
 *      Request param:
 *          curl -i -X GET -H "Authorization: TOKEN" http://localhost:4000/api/v1/companies
 *
 *      Response: A list of companies, or null if no companies are found
 */
router.get(
    '/companies',
    refreshTokenIfValid,
    authorizeRoles(Role.SYSTEM_ADMIN),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await dsMgr.getCompanies();
            res.json(result);
        } catch (err) {
            res.sendStatus(500);
            return next(err);
        }
    }
);

/**
 *  Creates a new company.
 *      Request param:
 *          curl -i -X POST -H "Content-Type: application/json" -H "Authorization: TOKEN"
 *          -d "{\"name\":\"micro\", \"nameKana\":\"マイクロ\", \"representative\":\"織田信長\",
 *          \"email\":\"info@micro.com\", \"postalCode\":\"158-1155\", \"prefecture\":\"東京都\",
 *          \"city\":\"目黒区\",  \"streetAddress\":\"目黒1－2－5\"}"
 *          http://localhost:4000/api/v1/company
 *
 */
router.post(
    '/company',
    [
        body('name').trim().notEmpty().isString(),
        body('nameKana').trim().notEmpty().isString(),
        body('representative').trim().notEmpty().isString(),
        body('email').trim().notEmpty().isEmail().normalizeEmail(),
        body('postalCode').trim().notEmpty().isString(),
        body('prefecture').trim().notEmpty().isString(),
        body('city').trim().notEmpty().isString(),
        body('streetAddress').trim().notEmpty().isString()
    ],
    refreshTokenIfValid,
    authorizeRoles(Role.SYSTEM_ADMIN),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await dsMgr.createCompany(req.body);
            res.sendStatus(200);
        } catch (err) {
            res.sendStatus(500);
            return next(err);
        }
    }
);

/**
 *  Updates company data.
 *      Request param:
 *          curl -i -X PUT -H "Content-Type: application/json" -H "Authorization: TOKEN"
 *          -d "{\"name\":\"micro\", \"nameKana\":\"マイクロ\", \"representative\":\"織田信長\",
 *          \"email\":\"info@micro.com\", \"postalCode\":\"158-1155\", \"prefecture\":\"東京都\",
 *          \"city\":\"目黒区\",  \"streetAddress\":\"目黒1－2－5\", \"status\":false}"
 *          http://localhost:4000/api/v1/company/5
 *
 */
router.put(
    '/company/:id',
    [
        param('id').exists().isNumeric(),
        body('name').trim().notEmpty().isString(),
        body('nameKana').trim().notEmpty().isString(),
        body('representative').trim().notEmpty().isString(),
        body('email').trim().notEmpty().isEmail().normalizeEmail(),
        body('postalCode').trim().notEmpty().isString(),
        body('prefecture').trim().notEmpty().isString(),
        body('city').trim().notEmpty().isString(),
        body('streetAddress').trim().notEmpty().isString(),
        body('status').notEmpty().isBoolean()
    ],
    refreshTokenIfValid,
    authorizeRoles(Role.SYSTEM_ADMIN),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const companyId = Number(req.params.id);
            await dsMgr.updateCompany(companyId, req.body);
            res.sendStatus(200);
        } catch (err) {
            res.sendStatus(500);
            return next(err);
        }
    }
);

/**
 * Remove a company and all users associated with it.
 *     Request param:
 *          curl -i -X PATCH -H "Authorization: TOKEN" http://localhost:4000/api/v1/company/5
 *
 */
router.patch(
    '/company/:id',
    [param('id').exists().isNumeric()],
    refreshTokenIfValid,
    authorizeRoles(Role.SYSTEM_ADMIN),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const companyId = Number(req.params.id);
            await dsMgr.removeCompanyWithUsers(companyId);
            res.sendStatus(200);
        } catch (err) {
            if (err instanceof UserModificationError) {
                res.sendStatus(406);
            } else {
                res.sendStatus(500);
            }
            return next(err);
        }
    }
);

/**
 *  Gets a list of histories.
 *      Request param:
 *          curl -i -X GET -H "Authorization: TOKEN" http://localhost:4000/api/v1/histories/5
 *
 *      Response: The list of histories
 */
router.get(
    '/histories/:userId',
    [param('userId').exists().isNumeric()],
    refreshTokenIfValid,
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authPayload: AuthTokenPayload | undefined = req.user;
            if (!authPayload) {
                res.sendStatus(403);
                return;
            }
            const userId: number = Number(req.params.userId);
            const result = await dsMgr.getHistories(userId, authPayload);
            res.json(result);
        } catch (err) {
            res.sendStatus(500);
            return next(err);
        }
    }
);

/**
 *  Gets a list of history details.
 *      Request param:
 *          curl -i -X GET -H "Authorization: TOKEN" http://localhost:4000/api/v1/historyChildren/3/user/5
 *
 *      Response: The list of child histories
 */
router.get(
    '/historyChildren/:historyParentId/user/:userId',
    [param('historyParentId').exists().isNumeric()],
    [param('userId').exists().isNumeric()],
    refreshTokenIfValid,
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authPayload: AuthTokenPayload | undefined = req.user;
            if (!authPayload) {
                res.sendStatus(403);
                return;
            }
            const historyParentId: number = Number(req.params.historyParentId);
            const userId: number = Number(req.params.userId);
            const result = await dsMgr.getHistoryChildren(historyParentId, userId, authPayload);
            res.json(result);
        } catch (err) {
            res.sendStatus(500);
            return next(err);
        }
    }
);

/**
 *  Floorplan generation request.
 *      Request param:
 *          curl -i -X POST -H "Content-Type: application/json" -H "Authorization: TOKEN"
 *          -d "{\"title\": \"佐藤様邸間取りプラン\", \"clientName\": \"佐藤太郎\",
 *          \"layout_conditions\": {
 *              \"family_composition\": {\"value\": \"4\", \"unit\": \"people\"},
 *              \"number_of_floors\": {\"value\": \"2\"},
 *              \"frontage\": {\"value\": \"20\", \"unit\": \"pit\"},
 *              \"depth\": {\"value\": \"12\", \"unit\": \"pit\"},
 *              \"desired_LDK_area\": {\"value\": \"18\", \"unit\": \"tatami\"},
 *              \"number_of_rooms\": {\"value\": \"3\", \"unit\": \"rooms\"},
 *              \"number_of_toilets\": {\"value\": \"2\", \"unit\": \"units\"},
 *              \"commitment_flow_lines\": {\"value\": \"玄関からキッチンまで動線を短く\", \"unit\": \"text\"}
 *          }}"
 *          http://localhost:4000/api/v1/floorplans
 *
 *      Response: jobId
 *
 */
router.post(
    '/floorplans',
    [
        body('title').trim().notEmpty().isString(),
        body('clientName').trim().notEmpty().isString(),
        body('layout_conditions').notEmpty().isObject(),
        body('layout_conditions.family_composition.value').trim().notEmpty().isString(),
        body('layout_conditions.family_composition.unit').trim().notEmpty().isString(),
        body('layout_conditions.number_of_floors.value').trim().notEmpty().isString(),
        body('layout_conditions.frontage.value').trim().notEmpty().isString(),
        body('layout_conditions.frontage.unit').trim().notEmpty().isString(),
        body('layout_conditions.depth.value').trim().notEmpty().isString(),
        body('layout_conditions.depth.unit').trim().notEmpty().isString(),
        body('layout_conditions.desired_LDK_area.value').trim().notEmpty().isString(),
        body('layout_conditions.desired_LDK_area.unit').trim().notEmpty().isString(),
        body('layout_conditions.number_of_rooms.value').trim().notEmpty().isString(),
        body('layout_conditions.number_of_rooms.unit').trim().notEmpty().isString(),
        body('layout_conditions.number_of_toilets.value').trim().notEmpty().isString(),
        body('layout_conditions.number_of_toilets.unit').trim().notEmpty().isString(),
        body('layout_conditions.commitment_flow_lines.value').optional().isString(),
        body('layout_conditions.commitment_flow_lines.unit').optional().isString()
    ],
    refreshTokenIfValid,
    authorizeRoles(Role.MEMBER),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authPayload: AuthTokenPayload | undefined = req.user;
            if (!authPayload) {
                res.sendStatus(403);
                return;
            }
            const userId: number = authPayload.userId;
            const jobId = await dsMgr.createFloorplanGenerationJob(req.body, userId);
            res.json(jobId);
        } catch (err) {
            res.sendStatus(500);
            return next(err);
        }
    }
);

/**
 *  Get floorplan generation status.
 *      Request param:
 *          curl -i -X GET -H "Authorization: TOKEN"
 *          http://localhost:4000/api/v1/floorplans/status/550e8400-e29b-41d4-a716-446655440000
 *
 *      Response: Floorplan generation status information
 *
 */
router.get(
    '/floorplans/status/:jobId/',
    [param('jobId').trim().notEmpty().isString().isLength({ min: 36, max: 36 })],
    refreshTokenIfValid,
    authorizeRoles(Role.MEMBER),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await dsMgr.getFloorplanGenerationStatus(req.params.jobId);
            res.json(result);
        } catch (err) {
            if (err instanceof FloorplanGenerationError) {
                res.sendStatus(404);
            } else {
                res.sendStatus(500);
            }
            return next(err);
        }
    }
);

/**
 *  Get floorplan generation results.
 *      Request param:
 *          curl -i -X GET -H "Authorization: TOKEN"
 *          http://localhost:4000/api/v1/floorplans/results/550e8400-e29b-41d4-a716-446655440000
 *
 *      Response: Floorplan generation results
 *
 */
router.get(
    '/floorplans/results/:jobId/',
    [param('jobId').trim().notEmpty().isString().isLength({ min: 36, max: 36 })],
    refreshTokenIfValid,
    authorizeRoles(Role.MEMBER),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authPayload: AuthTokenPayload | undefined = req.user;
            if (!authPayload) {
                res.sendStatus(403);
                return;
            }
            const result = await dsMgr.getFloorplanGenerationResults(req.params.jobId, authPayload);
            res.json(result);
        } catch (err) {
            if (err instanceof FloorplanGenerationError) {
                res.sendStatus(404);
            } else if (err instanceof FloorplanGenerationNotCompletedError) {
                res.sendStatus(425);
            } else {
                res.sendStatus(500);
            }
            return next(err);
        }
    }
);

/**
 *  Toggles the favorite status of a floorplan.
 *      Request param:
 *          curl -i -X PUT -H "Content-Type: application/json" -H "Authorization: TOKEN"
 *          -d "{\"isPatternFavorite\": true}"
 *          http://localhost:4000/api/v1/floorplans/plans/5/favorite
 *
 */
router.put(
    '/floorplans/plans/:historyChildId/favorite',
    [
        param('historyChildId').exists().isNumeric(),
        body('isPatternFavorite').notEmpty().isBoolean()
    ],
    refreshTokenIfValid,
    authorizeRoles(Role.MEMBER),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const historyChildId = Number(req.params.historyChildId);
            await dsMgr.toggleHistoryChildFavorite(historyChildId, req.body.isPatternFavorite);
            res.sendStatus(200);
        } catch (err) {
            res.sendStatus(500);
            return next(err);
        }
    }
);

/**
 *  Deletes a floorplan.
 *      Request param:
 *          curl -i -X DELETE -H "Authorization: TOKEN"
 *          http://localhost:4000/api/v1/floorplans/plans/5
 *
 */
router.delete(
    '/floorplans/plans/:historyChildId',
    [param('historyChildId').exists().isNumeric()],
    refreshTokenIfValid,
    authorizeRoles(Role.MEMBER),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const historyChildId = Number(req.params.historyChildId);
            await dsMgr.removeHistoryChild(historyChildId);
            res.sendStatus(200);
        } catch (err) {
            res.sendStatus(500);
            return next(err);
        }
    }
);

/**
 *  Regenerate floorplan.
 *      Request param:
 *          curl -i -X POST -H "Authorization: TOKEN"
 *          http://localhost:4000/api/v1/floorplans/regeneration/5
 *
 *      Response: jobId
 *
 */
router.post(
    '/floorplans/regeneration/:historyParentId',
    [param('historyParentId').exists().isNumeric()],
    refreshTokenIfValid,
    authorizeRoles(Role.MEMBER),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authPayload: AuthTokenPayload | undefined = req.user;
            if (!authPayload) {
                res.sendStatus(403);
                return;
            }
            const historyParentId: number = Number(req.params.historyParentId);
            const userId: number = authPayload.userId;
            const jobId = await dsMgr.regenerateFloorplan(historyParentId, userId);
            res.json(jobId);
        } catch (err) {
            if (err instanceof FloorplanGenerationError) {
                res.sendStatus(404);
            } else {
                res.sendStatus(500);
            }
            return next(err);
        }
    }
);

/**
 *  Updates a floorplan.
 *      Request param:
 *          curl -i -X PUT -H "Content-Type: application/json" -H "Authorization: TOKEN"
 *          -d "{\"floorplanData\": {
 *              \"first_floor_area\": 120.5,
 *              \"second_floor_area\": 95.3,
 *              \"total_floor_area\": 215.8,
 *              \"tag\": [\"hogehoge\", \"naninani\", \"wowo\"],
 *              \"type\": \"リビングが広いプラン\",
 *              \"1\": {
 *                  \"rooms\": [
 *                      {\"name\": \"エントランス\", \"x\": 6.0, \"y\": 0.0, \"width\": 2.0, \"height\": 2.0}
 *                  ],
 *                  \"objects\": [
 *                      {\"name\": \"シンク\", \"x\": 3.5, \"y\": 4.5, \"width\": 1.0, \"height\": 2.0, \"imageUrl\": \"https://test/images/sample.jpg\"}
 *                  ]
 *              },
 *              \"2\": {
 *                  \"rooms\": [
 *                      {\"name\": \"廊下\", \"x\": 1.0, \"y\": 1.0, \"width\": 8.0, \"height\": 1.0}
 *                  ],
 *                  \"objects\": [
 *                      {\"name\": \"ベッド\", \"x\": 8.5, \"y\": 2.5, \"width\": 2.5, \"height\": 1.5, \"imageUrl\": \"https://test/images/sample.jpg\"}
 *                  ]
 *              }
 *          }}"
 *          http://localhost:4000/api/v1/floorplans/update/5
 *
 */
router.put(
    '/floorplans/update/:historyChildId',
    [param('historyChildId').exists().isNumeric(), body('floorplanData').notEmpty().isObject()],
    refreshTokenIfValid,
    authorizeRoles(Role.MEMBER),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const historyChildId = Number(req.params.historyChildId);
            await dsMgr.updateFloorplan(historyChildId, req.body.floorplanData);
            res.sendStatus(200);
        } catch (err) {
            res.sendStatus(500);
            return next(err);
        }
    }
);

/**
 *  Gets a list of equipment images.
 *      Request param:
 *          curl -i -X GET -H "Authorization: TOKEN"
 *          http://localhost:4000/api/v1/floorplans/images
 *
 *      Response: List of equipment images
 *
 */
router.get(
    '/floorplans/images',
    refreshTokenIfValid,
    authorizeRoles(Role.MEMBER),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const images = await dsMgr.getFloorplanImages();
            res.json(images);
        } catch (err) {
            res.sendStatus(500);
            return next(err);
        }
    }
);

/**
 *  Uploads an equipment image.
 *      Request param:
 *          curl -i -X POST -H "Authorization: TOKEN" -F "image=@/path/to/椅子1_椅子.png"
 *          http://localhost:4000/api/v1/floorplans/image
 *
 */
router.post(
    '/floorplans/image',
    refreshTokenIfValid,
    authorizeRoles(Role.MEMBER),
    upload.single('image'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No image file provided' });
                return;
            }

            await dsMgr.uploadFloorplanImage(req.file);
            res.sendStatus(200);
        } catch (err) {
            if (err instanceof FloorplanImageError) {
                res.sendStatus(400);
            } else {
                res.sendStatus(500);
            }
            return next(err);
        }
    }
);

/**
 *  Deletes an equipment image.
 *      Request param:
 *          curl -i -X DELETE -H "Content-Type: application/json" -H "Authorization: TOKEN"
 *          -d "{\"name\": \"テーブル3_テーブル.png\"}"
 *          http://localhost:4000/api/v1/floorplans/image
 *
 */
router.delete(
    '/floorplans/image',
    [body('name').trim().notEmpty().isString()],
    refreshTokenIfValid,
    authorizeRoles(Role.MEMBER),
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await dsMgr.deleteFloorplanImage(req.body.name);
            res.sendStatus(200);
        } catch (err) {
            if (err instanceof FloorplanImageError) {
                res.sendStatus(400);
            } else {
                res.sendStatus(500);
            }
            return next(err);
        }
    }
);

/**
 * Callback endpoint for floorplan generation completion.
 */
router.post(
    '/floorplans/callback',
    [body('jobId').notEmpty().isString(), body('result').notEmpty().isObject()],
    validatorErrorChecker,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { jobId, result } = req.body;
            await dsMgr.completeFloorplanGenerationJob(jobId, result);
            res.sendStatus(200);
        } catch (err) {
            res.sendStatus(500);
            return next(err);
        }
    }
);

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Access it at http://localhost:${PORT}`);
});
