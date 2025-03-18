/**
 * 事件列表
 */
export let eventList = {
    YaddSubYun: (m_detail) => {
        let event = new CustomEvent("YaddSubYun", { detail: m_detail });
        return event;
    },
    /** @param {function} func */
    Yhandle: (func) => {
        let event = new CustomEvent("Yhandle", { detail: func });
        return event;
    },
    /** @param {id} id */
    YaddSubYun: (id) => {
        let event = new CustomEvent("YaddSubYun", { detail: id });
        return event;
    },
    /** @param {id} id */
    YremoveSubYun: (id) => {
        let event = new CustomEvent("YremoveSubYun", { detail: id });
        return event;
    },
    Yupdataing: () => {
        let event = new CustomEvent("Yupdataing", { detail: null });
        return event;
    },
    YupdateComplete: () => {
        let event = new CustomEvent("YupdateComplete", { detail: null });
        return event;
    },
    Ydelete: () => {
        let event = new CustomEvent("Ydelete", { detail: null });
        return event;
    }
}