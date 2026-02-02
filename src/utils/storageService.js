const KITS_KEY = 'linkedin_banner_kits';
const OLD_BRAND_KIT_KEY = 'linkedin_banner_brand_kit';

export const saveKits = (kits) => {
    try {
        localStorage.setItem(KITS_KEY, JSON.stringify(kits));
    } catch (error) {
        console.error("Failed to save kits:", error);
    }
};

export const getKits = () => {
    try {
        // Migration Check
        const oldData = localStorage.getItem(OLD_BRAND_KIT_KEY);
        let kits = [];

        const storedKits = localStorage.getItem(KITS_KEY);
        if (storedKits) {
            kits = JSON.parse(storedKits);
        }

        if (oldData && !localStorage.getItem('migration_done')) {
            try {
                const oldKit = JSON.parse(oldData);
                // Convert old kit to new format
                if (oldKit.brandName || oldKit.logo || oldKit.colors) {
                    const migratedKit = {
                        id: Date.now(),
                        type: 'brand',
                        name: oldKit.brandName || 'Migrated Brand',
                        colors: oldKit.colors || ['#000000', '#ffffff', '#808080'],
                        font: oldKit.font || 'Inter',
                        logo: oldKit.logo
                    };
                    kits.push(migratedKit);
                }
                localStorage.setItem(KITS_KEY, JSON.stringify(kits));
                localStorage.setItem('migration_done', 'true');
                // Optional: localStorage.removeItem(OLD_BRAND_KIT_KEY); 
            } catch (e) {
                console.error("Migration failed", e);
            }
        }

        return kits;
    } catch (error) {
        console.error("Failed to load kits:", error);
        return [];
    }
};

