import api from "./api"
import ENDPOINTS from "../lib/api/endpoints"

const { AUDIT } = ENDPOINTS;

export const startAuditSesstion = async ({ userId = 1, note }) => {
    try {
        const res = await api.post(AUDIT.START_SESSION, { userId, note });
        console.log("res startAuditSesstion: ", res)
        return res;
    } catch (error) {
        console.error("Error startAuditSesstion: ", error);
        throw error;
    }
}

export const getAuditSessionDetail = async (id) => {
    try {
        const res = await api.get(AUDIT.AUDIT_DETAIL(id));
        console.log("res getAuditSessionDetail: ", res)
        return res;
    } catch (error) {
        console.error("Error getAuditSessionDetail: ", error);
        throw error;
    }
}

export const submitItem = async ({ sessionId, productId, actualQuantity, note }) => {
    try {
        const res = await api.post(AUDIT.AUDIT_SUBMIT_ITEM, { sessionId, productId, actualQuantity, note });
        console.log("res submitItem: ", res)
        return res;
    } catch (error) {
        console.error("Error submitItem: ", error);
        throw error;
    }
}

export const auditFinalize = async ({ sessionId, finalNote }) => {
    try {
        const res = await api.post(AUDIT.AUDIT_FINALIZE, { sessionId, finalNote });
        console.log("res auditFinalize: ", res)
        return res;
    } catch (error) {
        console.error("Error auditFinalize: ", error);
        throw error;
    }
}

export const auditHistory = async () => {
    try {
        const res = await api.get(AUDIT.AUDIT_HISTORY);
        console.log("res auditHistory: ", res)
        return res;
    } catch (error) {
        console.error("Error auditHistory: ", error);
        throw error;
    }
}