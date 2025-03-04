<script lang="ts">
    import { onMount } from 'svelte';
    import { 
        AdMob, 
        BannerAdPosition,
        BannerAdSize,
        BannerAdPluginEvents,
        InterstitialAdPluginEvents,
        RewardAdPluginEvents
    } from '@capacitor-community/admob';

    let adStatus = '';
    let rewardAmount = 0;
    let rewardType = '';
    let isBannerShown = false;
    let isLoading = false;
    let rewardedAdLoaded = false;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 5000; // 5 seconds

    // Test IDs for AdMob - using the official Google test IDs
    // These are guaranteed to return test ads
    const testBannerId = 'ca-app-pub-3940256099942544/6300978111';
    const testInterstitialId = 'ca-app-pub-3940256099942544/1033173712';
    const testRewardedId = 'ca-app-pub-3940256099942544/5224354917';

    onMount(async () => {
        try {
            // Initialize AdMob with test mode
            await AdMob.initialize({
                testingDevices: ['EMULATOR'],
                initializeForTesting: true
            });
            adStatus = 'AdMob initialized successfully';
            
            // Set up event listeners
            AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
                adStatus = 'Banner ad loaded';
                isLoading = false;
            });

            AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error) => {
                adStatus = `Banner ad failed to load: ${error.message}`;
                isLoading = false;
                console.error('Banner ad failed to load:', error);
            });

            AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
                adStatus = 'Interstitial ad loaded';
                isLoading = false;
            });

            AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error) => {
                adStatus = `Interstitial ad failed to load: ${error.message}`;
                isLoading = false;
                console.error('Interstitial ad failed to load:', error);
            });

            AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
                adStatus = 'Reward ad loaded';
                isLoading = false;
                rewardedAdLoaded = true;
            });

            AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error) => {
                adStatus = `Reward ad failed to load: ${error.message}`;
                isLoading = false;
                rewardedAdLoaded = false;
                console.error('Reward ad failed to load:', error);
                
                // Retry logic for "No fill" errors (error code 3)
                if (error.message === "No fill." && retryCount < MAX_RETRIES) {
                    retryCount++;
                    adStatus = `Reward ad failed to load: No fill. Retrying (${retryCount}/${MAX_RETRIES})...`;
                    
                    setTimeout(() => {
                        loadRewardedAd();
                    }, RETRY_DELAY);
                } else if (retryCount >= MAX_RETRIES) {
                    adStatus = `Failed to load reward ad after ${MAX_RETRIES} attempts`;
                    retryCount = 0;
                }
            });

            AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward) => {
                rewardAmount = reward.amount;
                rewardType = reward.type;
                adStatus = `Received reward: ${reward.amount} ${reward.type}`;
                rewardedAdLoaded = false;
                
                // Preload the next rewarded ad after receiving a reward
                setTimeout(() => {
                    loadRewardedAd();
                }, 1000);
            });

            AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
                adStatus = 'Reward ad was dismissed';
                rewardedAdLoaded = false;
                
                // Preload the next rewarded ad after dismissal
                setTimeout(() => {
                    loadRewardedAd();
                }, 1000);
            });

            // Pre-load interstitial and rewarded ads
            try {
                await AdMob.prepareInterstitial({
                    adId: testInterstitialId,
                    isTesting: true
                });
                console.log('Interstitial ad pre-loaded');
            } catch (error) {
                console.error('Failed to pre-load interstitial ad:', error);
            }

            // Load the rewarded ad
            loadRewardedAd();
        } catch (error) {
            adStatus = `Error initializing AdMob: ${error.message}`;
            console.error('Error initializing AdMob:', error);
        }
    });

    async function loadRewardedAd() {
        try {
            isLoading = true;
            adStatus = 'Pre-loading rewarded ad...';
            retryCount = 0;
            
            await AdMob.prepareRewardVideoAd({
                adId: testRewardedId,
                isTesting: true,
                ssv: {
                    userId: "test-user-id",
                    customData: JSON.stringify({
                        level: 5,
                        score: 100
                    })
                }
            });
            console.log('Rewarded ad pre-loaded');
            rewardedAdLoaded = true;
            isLoading = false;
        } catch (error) {
            console.error('Failed to pre-load rewarded ad:', error);
            rewardedAdLoaded = false;
            isLoading = false;
            
            // Handle the error here if needed
            if (error.message === "No fill." && retryCount < MAX_RETRIES) {
                retryCount++;
                adStatus = `Reward ad failed to load: No fill. Retrying (${retryCount}/${MAX_RETRIES})...`;
                
                setTimeout(() => {
                    loadRewardedAd();
                }, RETRY_DELAY);
            }
        }
    }

    async function showBannerAd() {
        try {
            isLoading = true;
            adStatus = 'Loading banner ad...';
            
            if (isBannerShown) {
                await AdMob.removeBanner();
                isBannerShown = false;
                adStatus = 'Banner ad removed';
                isLoading = false;
                return;
            }

            await AdMob.showBanner({
                adId: testBannerId,
                adSize: BannerAdSize.ADAPTIVE_BANNER,
                position: BannerAdPosition.BOTTOM_CENTER,
                margin: 0,
                isTesting: true
            });
            isBannerShown = true;
            adStatus = 'Showing banner ad';
        } catch (error) {
            adStatus = `Error showing banner ad: ${error.message}`;
            isLoading = false;
            console.error('Error showing banner ad:', error);
        }
    }

    async function showInterstitialAd() {
        try {
            isLoading = true;
            adStatus = 'Loading interstitial ad...';
            
            // Prepare interstitial
            await AdMob.prepareInterstitial({
                adId: testInterstitialId,
                isTesting: true
            });
            adStatus = 'Interstitial ad prepared, showing now';
            
            // Show interstitial
            await AdMob.showInterstitial();
        } catch (error) {
            adStatus = `Error showing interstitial ad: ${error.message}`;
            isLoading = false;
            console.error('Error showing interstitial ad:', error);
        }
    }

    async function showRewardedAd() {
        try {
            if (!rewardedAdLoaded) {
                isLoading = true;
                adStatus = 'Loading rewarded ad...';
                
                // Prepare rewarded ad
                await AdMob.prepareRewardVideoAd({
                    adId: testRewardedId,
                    isTesting: true,
                    ssv: {
                        userId: "test-user-id",
                        customData: JSON.stringify({
                            level: 5,
                            score: 100
                        })
                    }
                });
                rewardedAdLoaded = true;
            }
            
            adStatus = 'Reward ad prepared, showing now';
            
            // Show rewarded ad
            await AdMob.showRewardVideoAd();
        } catch (error) {
            adStatus = `Error showing reward ad: ${error.message}`;
            isLoading = false;
            console.error('Error showing reward ad:', error);
            
            // If showing fails, try to reload
            if (!rewardedAdLoaded) {
                loadRewardedAd();
            }
        }
    }
</script>

<div class="container">
    <h1>AdMob Test App</h1>
    
    <div class="status-box">
        <p>Status: {adStatus}</p>
        {#if isLoading}
            <p class="loading">Loading...</p>
        {/if}
        {#if rewardAmount > 0}
            <p>Reward received: {rewardAmount} {rewardType}</p>
        {/if}
    </div>

    <div class="button-container">
        <button on:click={showBannerAd} disabled={isLoading}>
            {isBannerShown ? 'Hide Banner Ad' : 'Show Banner Ad'}
        </button>
        
        <button on:click={showInterstitialAd} disabled={isLoading}>
            Show Interstitial Ad
        </button>
        
        <button on:click={showRewardedAd} disabled={isLoading}>
            Show Rewarded Video Ad
        </button>
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
        height: 100%;
        max-width: 100%;
        box-sizing: border-box;
    }

    h1 {
        font-size: 1.5rem;
        margin-bottom: 20px;
        text-align: center;
    }

    .status-box {
        background-color: #f0f0f0;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
        width: 100%;
        max-width: 400px;
        min-height: 80px;
    }

    .loading {
        color: #4a90e2;
        font-weight: bold;
    }

    .button-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        max-width: 400px;
        gap: 15px;
    }

    button {
        background-color: #4a90e2;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 15px;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    button:hover:not([disabled]) {
        background-color: #357ab8;
    }

    button[disabled] {
        background-color: #cccccc;
        cursor: not-allowed;
    }

    p {
        margin: 5px 0;
    }

    @media (max-width: 600px) {
        .container {
            padding: 15px;
        }
        
        button {
            padding: 12px;
        }
    }
</style>
