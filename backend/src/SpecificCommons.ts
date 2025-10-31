/*
    SpecificCommons.ts
    application specific utilities.
*/

export const AppConstant = {
    BCRYPT: {
        SALT_ROUNDS: 10
    },
    FLOORPLAN: {
        GENERATION: {
            STATUS: {
                PROCESSING: 'processing',
                COMPLETED: 'completed'
            }
        },
        IMAGE: {
            MAX_FILE_SIZE: 5 * 1024 * 1024
        }
    },
    DEFAULT_NULL_STRING: 'Not entered'
};
