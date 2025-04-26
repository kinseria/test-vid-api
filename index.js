import puppeteer from 'puppeteer';

async function autoRecord() {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-accelerated-2d-canvas',
            '--no-zygote',
            '--disable-dev-shm-usage',
            '--single-process',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            '--disable-audio-output',
        ],
    });

    const page = await browser.newPage();

    console.log('Opening recording page...');
    await page.goto('https://test-vid-api.surge.sh/?video=https://test-vid-api.surge.sh/video.mp4&audio=https://test-vid-api.surge.sh/video.mp4', {
        waitUntil: 'networkidle2',
    });

    console.log('Waiting for recording to finish (tracking telegram-status-message)...');

    // Wait until the telegram-status-message shows a specific text like "done" (you can adjust)
    await page.waitForFunction(() => {
        const statusDiv = document.getElementById('telegram-status-message');
        if (!statusDiv) return false;
        const text = statusDiv.textContent.trim().toLowerCase();
        console.log('Current Status:', text);
        return text;
    }, {
        timeout: 5 * 60 * 1000, // 5 minutes max
        polling: 2000, // check every 2 seconds
    });

    console.log('Recording/uploading done! Closing browser.');
    await browser.close();
}

autoRecord().catch(err => {
    console.error('Error in autoRecord:', err);
    process.exit(1);
});
