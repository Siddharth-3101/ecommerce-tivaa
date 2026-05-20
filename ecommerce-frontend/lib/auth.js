export const saveUser = (user, token) => {
    if (typeof window === "undefined") return;

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
};

export const getUser = () => {
    if (typeof window === "undefined") return null;

    const data = localStorage.getItem("user");
    if (!data || data === "undefined") return null;

    try {
        return JSON.parse(data);
    } catch {
        return null;
    }
};

export const getToken = () => {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("token");
    if (!token || token === "undefined") return null;

    return token;
};

export const logout = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("user");
    localStorage.removeItem("token");
};
