import puppeteer from 'puppeteer';

async function autoRecord() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    console.log('Opening recording page...');
    try {
        await page.goto('https://test-vid-api.surge.sh/?video=https://test-vid-api.surge.sh/video.mp4&audio=https://test-vid-api.surge.sh/video.mp4', {
            waitUntil: 'networkidle2',
        });
        console.log('Page loaded successfully!');
    } catch (error) {
        console.error('Error loading page:', error);
        await browser.close();
        return;
    }

    console.log('Waiting for recording to finish...');

    // Monitor the #telegram-status-message div for updates
    const statusSelector = '#telegram-status-message';
    let statusMessage = await page.$eval(statusSelector, el => el.innerText);

    // Log initial status
    console.log(`Initial status: ${statusMessage}`);

    try {
        await new Promise(resolve => setTimeout(resolve, 120000)); // 2 minutes wait

        // Wait until the status message changes
        await page.waitForFunction(
            (selector, initialMessage) => {
                const el = document.querySelector(selector);
                return el && el.innerText !== initialMessage;
            },
            { timeout: 120000 },  // Wait for a max of 2 minutes
            statusSelector,
            statusMessage
        );

        // After waiting, get the final status message
        statusMessage = await page.$eval(statusSelector, el => el.innerText);
        console.log(`Final status: ${statusMessage}`);

        // Log whether the message indicates success or failure
        if (statusMessage.includes("Uploading")) {
            console.log('Uploading video...');
        } else if (statusMessage.includes("Uploaded")) {
            console.log('Video upload successful!');
        } else {
            console.log('Unexpected status:', statusMessage);
        }
    } catch (error) {
        console.error('Error during recording or status monitoring:', error);
    }

    console.log('Recording done. Closing browser.');
    await browser.close();
}

autoRecord().catch((error) => {
    console.error('Error in autoRecord process:', error);
});
