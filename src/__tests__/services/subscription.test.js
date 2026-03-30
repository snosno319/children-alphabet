/**
 * Tests for src/services/subscription.js
 *
 * The RevenueCat SDK (@revenuecat/purchases-capacitor) is mocked entirely —
 * it is a native Capacitor plugin and cannot run in a Node/jsdom environment.
 *
 * We test the service's own logic: status caching, event dispatch, and the
 * coordination between SDK responses and the isPro flag.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ---- Mock the RevenueCat SDK -----------------------------------------------
// vi.mock is hoisted above variable declarations, so we use vi.hoisted() to
// declare the mock functions before the factory runs.
const {
    mockGetCustomerInfo,
    mockGetOfferings,
    mockPurchasePackage,
    mockRestorePurchases,
    mockConfigure,
    mockSetLogLevel,
} = vi.hoisted(() => ({
    mockGetCustomerInfo: vi.fn(),
    mockGetOfferings: vi.fn(),
    mockPurchasePackage: vi.fn(),
    mockRestorePurchases: vi.fn(),
    mockConfigure: vi.fn(),
    mockSetLogLevel: vi.fn(),
}));

vi.mock('@revenuecat/purchases-capacitor', () => ({
    Purchases: {
        setLogLevel: mockSetLogLevel,
        configure: mockConfigure,
        getCustomerInfo: mockGetCustomerInfo,
        getOfferings: mockGetOfferings,
        purchasePackage: mockPurchasePackage,
        restorePurchases: mockRestorePurchases,
    },
    LOG_LEVEL: { DEBUG: 'DEBUG' },
}));

// Import AFTER the mock is in place
import { SubscriptionService } from '../../services/subscription.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCustomerInfo(isActive) {
    return {
        customerInfo: {
            entitlements: {
                active: isActive ? { pro_access: {} } : {},
            },
        },
    };
}

beforeEach(() => {
    vi.clearAllMocks();
    SubscriptionService.isPro = false;
    // Ensure we're in a non-native environment for most tests
    delete window.Capacitor;
});

// ---------------------------------------------------------------------------
// initialize()
// ---------------------------------------------------------------------------

describe('initialize()', () => {
    it('does not call Purchases.configure in a non-native environment', async () => {
        await SubscriptionService.initialize();
        expect(mockConfigure).not.toHaveBeenCalled();
    });

    it('does not throw when called in a non-native environment', async () => {
        await expect(SubscriptionService.initialize()).resolves.not.toThrow();
    });

    it('leaves isPro as false in a non-native environment', async () => {
        await SubscriptionService.initialize();
        expect(SubscriptionService.isPro).toBe(false);
    });

    it('calls Purchases.configure with the iOS key on a native iOS environment', async () => {
        window.Capacitor = { isNative: true, getPlatform: () => 'ios' };
        mockConfigure.mockResolvedValue(undefined);
        mockGetCustomerInfo.mockResolvedValue(makeCustomerInfo(false));

        await SubscriptionService.initialize();

        expect(mockConfigure).toHaveBeenCalledWith(
            expect.objectContaining({ apiKey: 'appl_YOUR_IOS_API_KEY' })
        );
    });

    it('calls Purchases.configure with the Android key on a native Android environment', async () => {
        window.Capacitor = { isNative: true, getPlatform: () => 'android' };
        mockConfigure.mockResolvedValue(undefined);
        mockGetCustomerInfo.mockResolvedValue(makeCustomerInfo(false));

        await SubscriptionService.initialize();

        expect(mockConfigure).toHaveBeenCalledWith(
            expect.objectContaining({ apiKey: 'goog_YOUR_ANDROID_API_KEY' })
        );
    });

    it('does not throw when configure throws (handles error gracefully)', async () => {
        window.Capacitor = { isNative: true, getPlatform: () => 'ios' };
        mockConfigure.mockRejectedValue(new Error('SDK failure'));

        await expect(SubscriptionService.initialize()).resolves.not.toThrow();
    });
});

// ---------------------------------------------------------------------------
// updateStatus()
// ---------------------------------------------------------------------------

describe('updateStatus()', () => {
    it('sets isPro to true when the entitlement is active', () => {
        SubscriptionService.updateStatus(makeCustomerInfo(true));
        expect(SubscriptionService.isPro).toBe(true);
    });

    it('sets isPro to false when the entitlement is not active', () => {
        SubscriptionService.isPro = true; // Start as Pro
        SubscriptionService.updateStatus(makeCustomerInfo(false));
        expect(SubscriptionService.isPro).toBe(false);
    });

    it('dispatches a "subscription-changed" CustomEvent with the Pro status', () => {
        const listener = vi.fn();
        window.addEventListener('subscription-changed', listener);

        SubscriptionService.updateStatus(makeCustomerInfo(true));

        expect(listener).toHaveBeenCalledOnce();
        expect(listener.mock.calls[0][0].detail).toBe(true);

        window.removeEventListener('subscription-changed', listener);
    });

    it('dispatches false when entitlement is inactive', () => {
        const listener = vi.fn();
        window.addEventListener('subscription-changed', listener);

        SubscriptionService.updateStatus(makeCustomerInfo(false));

        expect(listener.mock.calls[0][0].detail).toBe(false);

        window.removeEventListener('subscription-changed', listener);
    });
});

// ---------------------------------------------------------------------------
// checkStatus()
// ---------------------------------------------------------------------------

describe('checkStatus()', () => {
    it('calls getCustomerInfo and returns true when Pro', async () => {
        mockGetCustomerInfo.mockResolvedValue(makeCustomerInfo(true));

        const result = await SubscriptionService.checkStatus();

        expect(mockGetCustomerInfo).toHaveBeenCalledOnce();
        expect(result).toBe(true);
        expect(SubscriptionService.isPro).toBe(true);
    });

    it('returns false when not Pro', async () => {
        mockGetCustomerInfo.mockResolvedValue(makeCustomerInfo(false));

        const result = await SubscriptionService.checkStatus();

        expect(result).toBe(false);
        expect(SubscriptionService.isPro).toBe(false);
    });

    it('returns false and does not throw when getCustomerInfo rejects', async () => {
        mockGetCustomerInfo.mockRejectedValue(new Error('network error'));

        const result = await SubscriptionService.checkStatus();

        expect(result).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// purchase()
// ---------------------------------------------------------------------------

describe('purchase()', () => {
    it('returns true and sets isPro when purchase succeeds', async () => {
        const pkg = { identifier: 'monthly' };
        mockGetOfferings.mockResolvedValue({
            current: { availablePackages: [pkg] },
        });
        // purchasePackage returns { customerInfo }, which is then passed to updateStatus
        mockPurchasePackage.mockResolvedValue({ customerInfo: makeCustomerInfo(true) });

        const result = await SubscriptionService.purchase();

        expect(result).toBe(true);
        expect(SubscriptionService.isPro).toBe(true);
    });

    it('returns false (no throw) when user cancels the purchase dialog', async () => {
        const pkg = { identifier: 'monthly' };
        mockGetOfferings.mockResolvedValue({
            current: { availablePackages: [pkg] },
        });
        mockPurchasePackage.mockRejectedValue({ userCancelled: true });

        const result = await SubscriptionService.purchase();

        expect(result).toBe(false);
    });

    it('throws when purchase fails for a non-cancellation reason', async () => {
        const pkg = { identifier: 'monthly' };
        mockGetOfferings.mockResolvedValue({
            current: { availablePackages: [pkg] },
        });
        mockPurchasePackage.mockRejectedValue(new Error('payment failed'));

        await expect(SubscriptionService.purchase()).rejects.toThrow('payment failed');
    });

    it('throws when no offerings are available', async () => {
        mockGetOfferings.mockResolvedValue({ current: null });

        await expect(SubscriptionService.purchase()).rejects.toThrow('No offerings available');
    });

    it('throws when offerings are available but packages list is empty', async () => {
        mockGetOfferings.mockResolvedValue({
            current: { availablePackages: [] },
        });

        await expect(SubscriptionService.purchase()).rejects.toThrow('No offerings available');
    });
});

// ---------------------------------------------------------------------------
// restore()
// ---------------------------------------------------------------------------

describe('restore()', () => {
    it('returns true and sets isPro when previously purchased', async () => {
        // restorePurchases returns { customerInfo }, which is then passed to updateStatus
        mockRestorePurchases.mockResolvedValue({ customerInfo: makeCustomerInfo(true) });

        const result = await SubscriptionService.restore();

        expect(result).toBe(true);
        expect(SubscriptionService.isPro).toBe(true);
    });

    it('returns false when no previous purchases to restore', async () => {
        mockRestorePurchases.mockResolvedValue({ customerInfo: makeCustomerInfo(false) });

        const result = await SubscriptionService.restore();

        expect(result).toBe(false);
    });

    it('throws when restorePurchases rejects', async () => {
        mockRestorePurchases.mockRejectedValue(new Error('restore failed'));

        await expect(SubscriptionService.restore()).rejects.toThrow('restore failed');
    });
});
