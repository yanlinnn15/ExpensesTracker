const { createLogger, format, transports } = require('winston');

const EVENTS = {
    USER_REGISTERED:      'USER_REGISTERED',
    USER_LOGIN:           'USER_LOGIN',
    USER_LOGIN_FAILED:    'USER_LOGIN_FAILED',
    GUEST_CREATED:        'GUEST_CREATED',
    GUEST_DELETED:        'GUEST_DELETED',
    PASSWORD_CHANGED:     'PASSWORD_CHANGED',
    PASSWORD_RESET:       'PASSWORD_RESET',
    
    TRANSACTION_CREATED:  'TRANSACTION_CREATED',
    TRANSACTION_UPDATED:  'TRANSACTION_UPDATED',
    TRANSACTION_DELETED:  'TRANSACTION_DELETED',
    
    BUDGET_CREATED:       'BUDGET_CREATED',
    BUDGET_UPDATED:       'BUDGET_UPDATED',
    BUDGET_DELETED:       'BUDGET_DELETED',
    
    CATEGORY_CREATED:     'CATEGORY_CREATED',
    CATEGORY_UPDATED:     'CATEGORY_UPDATED',
    CATEGORY_DELETED:     'CATEGORY_DELETED',
};

const eventLog = createLogger({
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.File({ filename: 'logs/events.log' }),
    ],
});

const logEvent = (event, userId, data = {}) => {
    eventLog.info({ event, userId, ...data });
};

module.exports = { logEvent, EVENTS };
