import puppeteer from 'puppeteer';

async function autoRecord() {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--use-fake-device-for-media-stream',
            '--use-file-for-fake-audio-capture=/tmp/test.wav',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--force-device-scale-factor=1',
            '--force-dark-mode=0',
            '--disable-gpu',
            '--use-gl=swiftshader',
            '--window-size=1280,720',
        ],
        defaultViewport: {
            width: 1280,
            height: 720,
            deviceScaleFactor: 1,
        },
    });


    const page = await browser.newPage();

    console.log('Opening recording page...');
    await page.goto('https://test-vid-api.surge.sh/?video=https://test-vid-api.surge.sh/video.mp4&audio=https://test-vid-api.surge.sh/video.mp4', {
        waitUntil: 'networkidle2',
    });

    console.log('Setting up real-time status tracking...');

    // Expose a node.js function to receive logs from browser
    await page.exposeFunction('reportStatus', (status) => {
        console.log(`[Status] ${status}`);
    });

    // Inside the page, observe the telegram-status-message div for changes
    await page.evaluate(() => {
        const statusDiv = document.getElementById('telegram-status-message');
        if (!statusDiv) {
            console.error('telegram-status-message div not found!');
            return;
        }

        const observer = new MutationObserver(() => {
            const status = statusDiv.textContent.trim();
            window.reportStatus(status);
        });

        observer.observe(statusDiv, { childList: true, subtree: true, characterData: true });

        // Send initial status too
        window.reportStatus(statusDiv.textContent.trim());
    });

    console.log('Waiting for recording/uploading to complete...');

    // Now wait until the status matches "uploaded", "done", or "success"
    await page.waitForFunction(() => {
        const statusDiv = document.getElementById('telegram-status-message');
        if (!statusDiv) return false;
        const text = statusDiv.textContent.trim().toLowerCase();
        return text.includes('uploaded') || text.includes('done') || text.includes('success');
    }, {
        timeout: 5 * 60 * 1000, // 5 minutes max
        polling: 1000, // poll every 1 second
    });

    console.log('Recording/uploading done! Closing browser.');
    await browser.close();
}

autoRecord().catch(err => {
    console.error('Error in autoRecord:', err);
    process.exit(1);
});
