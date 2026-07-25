export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);
export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);
export const formatDate = (dateString) => {
    if (!dateString) return '-';
    const safeDateStr = dateString.includes('-') && dateString.length === 10 ? dateString.replace(/-/g, '/') : dateString;
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    if (dateString.length === 10) { delete options.hour; delete options.minute; }
    return new Date(safeDateStr).toLocaleDateString('id-ID', options);
};
export const formatShortDate = (dateString) => dateString ? new Date(dateString).toISOString().split('T')[0] : '';
export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => { clearTimeout(timeoutId); timeoutId = setTimeout(() => func.apply(null, args), delay); };
};