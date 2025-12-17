const ENDPOINTS = {
    AUTH: {
        LOGIN: `/api/v1/auth/login`,
        REGISTER: `/api/v1/auth/register`,
        CURRENT_USER: `/api/v1/auth/account`,
        LOGOUT: `/api/v1/auth/logout`
    },
    USER: {
        GET_PAGINATION: `/api/v1/user`,
        GET_BY_ID: (id) => `/api/v1/user/${id}`,
        CREATE: `/api/v1/user`,
        UPDATE: (id) => `/api/v1/user/${id}`,
        DELETE: (id) => `/api/v1/user/${id}`,
    },
    CUSTOMER: {
        GET_PAGINATION: `/api/v1/customer`,
        CREATE: `/api/v1/customer`,
        UPDATE: (id) => `/api/v1/customer/${id}`,
        DELETE: (id) => `/api/v1/customer/${id}`,
    },
    AUDIT: {
        START_SESSION: `/api/v1/audit/start`,
        AUDIT_DETAIL: (id) => `/api/v1/audit/${id}`,
        AUDIT_SUBMIT_ITEM: `/api/v1/audit/item`,
        AUDIT_FINALIZE: `/api/v1/audit/finalize`,
        AUDIT_HISTORY: `/api/v1/audit`
    }
};

export default ENDPOINTS;
