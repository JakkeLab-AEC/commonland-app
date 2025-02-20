declare global {
    interface JSON {
        tryParse<T>(jsonString: string): { success: true; data: T } | { success: false; error: any };
    }
}

Object.defineProperty(JSON, "tryParse", {
    value: function <T>(jsonString: string): { success: true; data: T } | { success: false; error: any } {
        try {
            const data = JSON.parse(jsonString) as T;
            return { success: true, data };
        } catch (error) {
            return { success: false, error };
        }
    },
    writable: true,
    configurable: true,
});

export {};