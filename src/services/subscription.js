import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

// TODO: Replace with your actual RevenueCat API Keys
const API_KEYS = {
    ios: 'appl_YOUR_IOS_API_KEY',
    android: 'goog_YOUR_ANDROID_API_KEY',
};

const ENTITLEMENT_ID = 'pro_access';

export const SubscriptionService = {
    isPro: false, // Local cache of status

    async initialize() {
        try {
            if (window.Capacitor && window.Capacitor.isNative) {
                await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

                const platform = window.Capacitor.getPlatform();
                const apiKey = platform === 'ios' ? API_KEYS.ios : API_KEYS.android;

                await Purchases.configure({ apiKey });
                await this.checkStatus();
            } else {
                console.warn('RevenueCat: Web environment detected. Pro access disabled by default (or set true for dev).');
                // For development/web testing, you might want to set this to true
                // this.isPro = true; 
            }
        } catch (e) {
            console.error('RevenueCat Init Error:', e);
        }
    },

    async checkStatus() {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            this.updateStatus(customerInfo);
            return this.isPro;
        } catch (e) {
            console.error('RevenueCat Status Check Error:', e);
            return false;
        }
    },

    updateStatus(customerInfo) {
        if (
            customerInfo.customerInfo.entitlements.active[ENTITLEMENT_ID] !==
            undefined
        ) {
            this.isPro = true;
        } else {
            this.isPro = false;
        }
        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('subscription-changed', { detail: this.isPro }));
    },

    async purchase() {
        try {
            const offerings = await Purchases.getOfferings();
            if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                const packageToBuy = offerings.current.availablePackages[0];
                const { customerInfo } = await Purchases.purchasePackage({ aPackage: packageToBuy });
                this.updateStatus(customerInfo);
                return true;
            } else {
                throw new Error('No offerings available');
            }
        } catch (e) {
            if (e.userCancelled) {
                return false; // User just closed the dialog
            }
            throw e;
        }
    },

    async restore() {
        try {
            const { customerInfo } = await Purchases.restorePurchases();
            this.updateStatus(customerInfo);
            return this.isPro;
        } catch (e) {
            console.error('Restore Error:', e);
            throw e;
        }
    }
};
