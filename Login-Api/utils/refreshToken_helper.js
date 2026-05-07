export const parseCookie = (req) => {
    const list = {};
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(';').forEach(cookie => {
        let [name, ...rest] = cookie.split('=');
        name = name.trim();
        if (!name) return;
        
        const value = rest.join('=').trim();
        try {
            // Guard against malformed URI components
            list[name] = decodeURIComponent(value);
        } catch (error) {
            list[name] = value; 
        }
    });
    return list;
};
